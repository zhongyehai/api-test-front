<template>
  <!--  <div class="tabs" style="width: 100%">-->
  <div>

    <!-- 结构树/接口列表 -->
    <el-tabs v-model="apiTab" class="table_padding table_api">

      <!-- 模块管理 -->
      <el-tab-pane label="接口列表" name="api">

        <!-- 根据当前窗口宽度，实时计算接口列表能展示的宽度 -->
        <el-row :style="{'min-width': apiListTableWidth}">

          <!-- 第一列，模块对应的接口列表 -->
          <el-col :span="21" style="padding-left: 5px;">
            <el-table
              ref="apiTree"
              v-loading="listLoading"
              @selection-change="handleApiMsgSelection"
              @row-dblclick="doubleClick"
              :data="apis.api_list"
              key="id"
              stripe
            >
              <el-table-column type="selection"></el-table-column>

              <el-table-column prop="num" label="编号" min-width="10%"></el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="name" label="接口名称" min-width="15%">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" content="可双击修改" placement="right-end">
                    <span> {{ scope.row.name }} </span>
                  </el-tooltip>
                </template>
              </el-table-column>

              <el-table-column
                :show-overflow-tooltip=true
                prop="addr"
                label="接口地址"
                min-width="35%"
              ></el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="10%">
                <template slot-scope="scope">
                  <span>{{ parsUser(scope.row.create_user) }}</span>
                </template>
              </el-table-column>

              <el-table-column label="接口操作" min-width="30%">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" content="复制接口" placement="top-end">
                    <el-button type="primary" size="mini" @click.native="copyApi(scope.row)">复制</el-button>
                  </el-tooltip>
                  <el-button type="danger" size="mini" @click.native="confirmBox(delApi, scope.row.id, scope.row.name)">
                    删除
                  </el-button>
                </template>
              </el-table-column>

            </el-table>

            <el-button @click="cancelSelection()" size="mini" style="position: absolute;margin-top: 2px;">
              取消选择
            </el-button>

            <pagination
              v-show="apis.api_total>0"
              :total="apis.api_total"
              :page.sync="defaultPage.pageNum"
              :limit.sync="defaultPage.apiPageSize"
              @pagination="getApiList"
            />
          </el-col>
        </el-row>
      </el-tab-pane>

    </el-tabs>

    <apiDialog
      :currentProject="currentProject"
      :currentModule="currentModule"
    ></apiDialog>

  </div>
</template>

<script>
import {userList} from '@/apis/user'
import {apiList, deleteApi} from '@/apis/api'
import Pagination from '@/components/Pagination'
import apiDialog from '@/views/api/apiDialog'

export default {
  name: 'index',
  components: {
    Pagination,
    apiDialog
  },

  // 接收父组件传参的key
  props: [
    'currentProject',
    'currentModule'
  ],
  data() {
    return {

      // 请求列表等待响应的状态
      listLoading: false,

      //  tab页的显示
      apiTab: 'api',

      // 初始化数据默认的数据
      defaultPage: {
        pageNum: 1,
        apiPageSize: 20
      },

      // 接口新增/编辑临时数据
      tempApi: {},

      // 用户列表
      user_list: [],

      // 接口数据列表
      apis: {
        api_total: 0,
        api_list: [],
        currentPage: undefined,
        currentApi: undefined
      },
    }
  },

  created() {

    // 初始化用户列表
    this.getUserList()
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

    // 双击进入编辑接口，把被点击的接口信息赋值给临时接口模板
    doubleClick(row, column, event) {
      this.tempApi = row
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
        'moduleId': this.currentModule.id,
        'pagNum': this.defaultPage.pageNum,
        'pageSize': this.defaultPage.apiPageSize
      }).then(response => {
        this.apis.api_list = response.data.data
        this.apis.api_total = response.data.total
      })
      this.listLoading = false
    },

    handleApiMsgSelection(val) {
      console.log(val)
    },

    //  清除接口选择复选框
    cancelSelection() {
      this.$refs.apiMultipleTable.clearSelection()
    }

  },
  computed: {
    // 接口列表能用的宽度
    apiListTableWidth() {
      return `${window.innerWidth - 700}px`
    }
  },

  watch: {

    // 监听父组件传过来的当前选中的模块，实时获取父组件传过来的模块信息对应下的接口列表
    'currentModule': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.getApiList({
          'moduleId': newVal.id,
          'pagNum': this.defaultPage.pageNum,
          'pageSize': this.defaultPage.apiPageSize
        })
      }
    }
  }
}
</script>

<style>

</style>
