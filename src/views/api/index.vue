<template>

  <div>

    <!-- 结构树/接口列表 -->
    <el-tabs v-model="apiTab" class="table_padding table_api">

      <!-- 模块管理 -->
      <el-tab-pane label="接口列表" name="api">

        <el-table
          ref="apiListTable"
          v-loading="listLoading"
          :data="api_list"
          row-key="id"
          stripe
        >
          <el-table-column prop="num" label="序号" min-width="7%">
            <template slot-scope="scope">
<!--              <span> {{ scope.$index + 1}} </span>-->
              <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="name" label="接口名称" min-width="15%">
            <template slot-scope="scope">
              <span> {{ scope.row.name }} </span>
            </template>
          </el-table-column>

          <el-table-column
            :show-overflow-tooltip=true
            prop="addr"
            label="接口地址"
            min-width="26%"
          ></el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="10%">
            <template slot-scope="scope">
              <span>{{ parsUser(scope.row.create_user) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="接口操作" min-width="39%">
            <template slot-scope="scope">

              <el-button size="mini" type="success" :loading="scope.row.isLoading" @click="runApis(scope.row)">
                运行
              </el-button>
              <el-button size="mini" type="primary" @click="showEditForm(scope.row)">
                修改
              </el-button>
              <el-tooltip class="item" effect="dark" content="复制接口" placement="top-end">
                <el-button type="primary" size="mini" @click.native="copyApi(scope.row)">复制</el-button>
              </el-tooltip>
              <el-button type="danger" size="mini" @click.native="confirmBox(delApi, scope.row.id, scope.row.name)">
                删除
              </el-button>
            </template>
          </el-table-column>

        </el-table>

        <pagination
          v-show="api_total>0"
          :total="api_total"
          :page.sync="pageNum"
          :limit.sync="pageSize"
          @pagination="getApiList"
        />
      </el-tab-pane>

    </el-tabs>

    <apiDialog
      :currentProject="currentProject"
      :currentModuleId="currentModuleId"
    ></apiDialog>

    <!-- 接口运行结果 -->
    <runApiResult :runApiResultData="runApiResultData"></runApiResult>

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'
import apiDialog from '@/views/api/apiDialog'
import runApiResult from '@/views/api/runApiResult'

import {userList} from '@/apis/user'
import {apiList, deleteApi, runApi, apiMsgSort} from '@/apis/api'
import {reportIsDone} from "@/apis/report";

export default {
  name: 'index',
  components: {
    Pagination,
    apiDialog,
    runApiResult
  },

  // 接收父组件传参的key
  props: [
    'currentProject',
    'currentModuleId'
  ],
  data() {
    return {

      // 请求列表等待响应的状态
      listLoading: false,

      // 运行接口按钮的loading状态
      isLoading: false,

      //  tab页的显示
      apiTab: 'api',

      // 接口新增/编辑临时数据
      tempApi: {},

      // 用户列表
      user_list: [],

      // 接口数据列表
      pageNum: 1,
      pageSize: 20,
      api_total: 0,
      api_list: [],

      // 调试接口的运行结果
      runApiResultData: null,

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
    }
  },

  created() {

    // 初始化用户列表
    this.getUserList()

    this.oldList = this.api_list.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  mounted() {
    // 监听 接口 Dialog 框 的提交状态，提交成功，则重新请求接口列表
    this.$bus.$on(this.$busEvents.apiDialogCommitSuccess, () => {
      this.getApiList()
    })
  },


  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听事件
    this.$bus.$off(this.$busEvents.apiDialogCommitSuccess)
  },

  methods: {

    // 打开编辑框
    showEditForm(row) {
      this.tempApi = JSON.parse(JSON.stringify(row))
      this.$bus.$emit(this.$busEvents.apiDialogStatus, 'edit', this.tempApi)
    },

    // 把用户id解析为用户名
    parsUser(userId) {
      for (let index in this.user_list) {
        let user_data = this.user_list[index]
        if (user_data.id === userId) {
          return user_data.name
        }
      }
    },

    // 用户列表
    getUserList() {
      userList().then(response => {
        this.user_list = response.data.data
      })
    },

    // 删除接口
    delApi(api_id) {
      deleteApi({'id': api_id}).then(response => {
        if (this.showMessage(this, response)) {
          this.getApiList()
        }
      })
    },

    // 复制接口
    copyApi(api) {
      this.tempApi = api
      this.tempApi.id = ''
      this.$bus.$emit(this.$busEvents.apiDialogStatus, 'copy', JSON.parse(JSON.stringify(this.tempApi)))
    },

    // 根据模块内容获取接口列表
    getApiList(params) {
      this.listLoading = true
      apiList({
        'moduleId': this.currentModuleId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.api_list = response.data.data
        this.api_total = response.data.total

        this.oldList = this.api_list.map(v => v.id)
        this.newList = this.oldList.slice()
      })
      this.listLoading = false
    },

    // 运行接口
    runApis(row) {
      this.$set(row, 'isLoading', true)
      runApi({
        'projectId': row.project_id,
        'apis': [row.id]
      }).then(runResponse => {
        if (this.showMessage(this, runResponse)) {

          // 触发运行成功，每三秒查询一次，
          // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
          // 已出结果，则停止查询，展示测试报告
          var that = this
          var queryCount = 0
          var timer = setInterval(function () {
            if (queryCount <= 10) {
              reportIsDone({'id': runResponse.data.report_id}).then(queryResponse => {
                if (queryResponse.data === 1) {
                  that.$set(row, 'isLoading', false)
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.$set(row, 'isLoading', false)
              that.$notify({
                title: '测试长时间未运行结束',
                message: '测试长时间未运行结束，不再等待，请到测试报告页查看测试报告',
                type: 'warning',
                duration: 0
              });
              clearInterval(timer)  // 关闭定时器
            }
          }, 3000)
        }

        // this.$set(row, 'isLoading', false)
        // this.runApiResultData = response.data.data
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`task.index.openReportById.reportId: ${JSON.stringify(reportId)}`)
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.apiListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.api_list.splice(evt.oldIndex, 1)[0]
          this.api_list.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          apiMsgSort({
            List: this.newList,
            pageNum: this.pageNum,
            pageSize: this.pageSize,
          }).then(response => {
            this.showMessage(this, response)
          })
        }
      })
    }

  },

  watch: {

    // 监听父组件传过来的当前选中的模块，实时获取父组件传过来的模块信息对应下的接口列表
    'currentModuleId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.getApiList({
          'moduleId': newVal,
          'pageNum': this.pageNum,
          'pageSize': this.pageSize
        })
      }
    }
  }
}
</script>

<style>

</style>
