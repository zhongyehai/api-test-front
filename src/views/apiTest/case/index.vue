<template>
  <div>

    <!-- 结构树/用例列表 -->
    <el-tabs v-model="caseTab" class="table_padding table_case">

      <!-- 用例管理 -->
      <el-tab-pane label="用例列表" name="case">

        <el-table
          ref="caseTable"
          v-loading="tableLoadingIsShow"
          element-loading-text="正在排序中"
          element-loading-spinner="el-icon-loading"
          :data="case_list"
          row-key="id"
          stripe
        >
          <el-table-column prop="num" label="序号" min-width="10%">
            <template slot-scope="scope">
              <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="name" label="用例名称" min-width="46%">
            <template slot-scope="scope">
              <span> {{ scope.row.name }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="10%">
            <template slot-scope="scope">
              <span>{{ parsUser(scope.row.create_user) }}</span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="create_user" label="最后修改人" min-width="12%">
            <template slot-scope="scope">
              <span>{{ parsUser(scope.row.update_user) }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" label="是否执行" min-width="15%">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.is_run" @change="changeCaseIsRun(scope.row)"></el-switch>
            </template>
          </el-table-column>

          <el-table-column label="用例操作" min-width="14%">
            <template slot-scope="scope">

              <el-tooltip
                class="item"
                effect="dark"
                content="运行测试用例并生成报告"
                placement="top-end">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-video-play"
                  :loading="scope.row.isShowRunLoading"
                  @click.native="runCase(scope.row)"></el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="编辑用例"
                placement="top-end">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  @click.native="editCase(scope.row)"></el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="复制用例及其步骤"
                placement="top-end">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-document-copy"
                  @click.native="copyCase(scope.row)"></el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="将删除此用例及此用例下的步骤"
                placement="top-end">
                <el-button
                  type="text"
                  size="mini"
                  style="color: red"
                  icon="el-icon-delete"
                  :loading="scope.row.isShowDeleteLoading"
                  @click.native="confirmBox(delCase, scope.row, `用例 ${scope.row.name}`)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="case_total>0"
          :total="case_total"
          :page.sync="pageNum"
          :limit.sync="pageSize"
          @pagination="getCaseList"
        />
      </el-tab-pane>

    </el-tabs>

    <caseDrawer
      :currentProjectId="currentProjectId"
      :currentSetId="currentSetId"
    ></caseDrawer>

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'
import caseDrawer from '@/views/apiTest/case/drawer'

import {userList} from '@/apis/user'
import {caseList, caseRun, deleteCase, putCaseIsRun, caseSort} from '@/apis/case'
import {reportIsDone} from "@/apis/report";

export default {
  name: 'index',
  components: {
    Pagination,
    caseDrawer
  },

  // 接收父组件传参的key
  props: [
    'currentProjectId',
    'currentSetId'
  ],
  data() {
    return {

      // 请求列表等待响应的状态
      tableLoadingIsShow: false,

      // tab页的显示
      caseTab: 'case',

      // 初始化数据默认的数据
      pageNum: 1,
      pageSize: 20,

      // 用例新增/编辑临时数据
      tempCase: {},

      // 服务列表数据
      project_list: [],

      // 模块列表数据
      module_list: [],

      // 用户列表
      user_list: [],

      // 用例数据列表
      case_total: 0,
      case_list: [],

      // dialog框状态，edit为编辑数据, create为新增数据
      caseDialogStatus: '',

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
    }
  },

  created() {
    // 初始化用户列表
    this.getUserList()

    this.oldList = this.case_list.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },


  mounted() {
    // 监听 caseDialog 是否提交成功
    this.$bus.$on(this.$busEvents.caseDialogCommitSuccess, (status) => {
      this.getCaseList()
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.caseDialogCommitSuccess)
  },

  methods: {

    // 编辑用例
    editCase(row) {
      // console.log('case.index.editCase.row: ', JSON.stringify(row))
      this.tempCase = row
      this.$bus.$emit(this.$busEvents.caseDialogStatus, 'edit', this.tempCase)
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

    // 删除用例
    delCase(row) {
      this.$set(row, 'isShowDeleteLoading', true)
      deleteCase({'id': row.id}).then(response => {
        this.$set(row, 'isShowDeleteLoading', false)
        if (this.showMessage(this, response)) {
          this.getCaseList()
        }
      })
    },

    // 复制用例
    copyCase(api) {
      this.tempCase = api
      this.tempCase.num = ''
      // console.log('case.index.methods.copyCase.this.tempCase: ', JSON.stringify(this.tempCase))
      this.$bus.$emit(this.$busEvents.caseDialogStatus, 'copy', this.tempCase)
    },

    // 运行用例
    runCase(caseData) {
      this.$set(caseData, 'isShowRunLoading', true)
      caseRun({
        caseId: [caseData.id]
      }).then(runResponse => {
        // console.log('case.index.methods.runCase.response: ', JSON.stringify(response))
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
                  that.$set(caseData, 'isShowRunLoading', false)
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.$set(caseData, 'isShowRunLoading', false)
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
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`api.dialogForm.openReportById.reportId: ${JSON.stringify(reportId)}`)
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },

    // 修改用例状态
    changeCaseIsRun(row) {
      putCaseIsRun({'id': row.id, 'is_run': row.is_run}).then(response => {
        this.showMessage(this, response)
      })
    },

    // 根据模块内容获取用例列表
    getCaseList(params) {
      this.tableLoadingIsShow = true
      caseList({
        'setId': this.currentSetId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.case_list = response.data.data
        this.case_total = response.data.total

        this.oldList = this.case_list.map(v => v.id)
        this.newList = this.oldList.slice()
      })
      this.tableLoadingIsShow = false
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.caseTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.case_list.splice(evt.oldIndex, 1)[0]
          this.case_list.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          caseSort({
            List: this.newList,
            pageNum: this.pageNum,
            pageSize: this.pageSize,
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    }
  },

  watch: {

    // 监听父组件传过来的当前选中的用例集，实时获取父组件传过来的用例集对应下的用例列表
    'currentSetId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.getCaseList({
            'caseSetId': newVal,
            'pageNum': this.pageNum,
            'pageSize': this.pageSize
          })
        } else {
          this.case_list = []
        }
      }
    },
  }
}
</script>

<style>

</style>
