<template>
  <div>

    <!-- 结构树/用例列表 -->
    <el-tabs v-model="caseTab" class="table_padding table_case">

      <!-- 用例管理 -->
      <el-tab-pane label="用例列表" name="case">

        <!-- 根据当前窗口宽度，实时计算用例列表能展示的宽度 -->
        <el-row :style="{'min-width': caseSetListTableWidth}">

          <el-col :span="21" style="padding-left: 5px;">
            <el-table
              ref="apiTree"
              v-loading="listLoading"
              @row-dblclick="doubleClick"
              :data="apis.api_list"
              stripe
            >
              <el-table-column prop="num" label="编号" min-width="10%"></el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="name" label="用例名称" min-width="30%">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" content="可双击修改" placement="right-end">
                    <span> {{ scope.row.name }} </span>
                  </el-tooltip>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="10%">
                <template slot-scope="scope">
                  <span>{{ parsUser(scope.row.create_user) }}</span>
                </template>
              </el-table-column>

              <el-table-column align="center" label="执行" min-width="10%">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.is_run" @change="changeCaseIsRun(scope.row)"></el-switch>
                </template>
              </el-table-column>

              <el-table-column label="用例操作" min-width="40%">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" content="复制用例及其步骤" placement="top-end">
                    <el-button type="primary" size="mini" @click.native="copyCase(scope.row)">
                      复制
                    </el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="运行测试用例并生成报告" placement="top-end">
                    <el-button type="primary" size="mini" @click.native="runCase(scope.row)">
                      运行
                    </el-button>
                  </el-tooltip>

                  <el-button type="danger" size="mini"
                             @click.native="confirmBox(
                               delCase,
                               scope.row.id,
                               ` ${scope.row.name} 及 此用例下的步骤`)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <pagination
              v-show="apis.api_total>0"
              :total="apis.api_total"
              :page.sync="defaultPage.pageNum"
              :limit.sync="defaultPage.apiPageSize"
              @pagination="getCaseList"
            />
          </el-col>
        </el-row>
      </el-tab-pane>

    </el-tabs>

    <caseDialog
      :currentProject="currentProject"
      :currentCaseSet="currentCaseSet"
    ></caseDialog>

  </div>
</template>

<script>

import Pagination from '@/components/Pagination'
import caseDialog from '@/views/case/caseDialog'

import {userList} from '@/apis/user'
import {caseList, caseRun, deleteCase, putCaseIsRun} from '@/apis/case'

export default {
  name: 'index',
  components: {
    Pagination,
    caseDialog
  },

  // 接收父组件传参的key
  props: [
    'currentProject',
    'currentCaseSet'
  ],
  data() {
    return {

      // 请求列表等待响应的状态
      listLoading: false,

      // tab页的显示
      caseTab: 'case',

      // 初始化数据默认的数据
      defaultPage: {
        pageNum: 1,
        apiPageSize: 20
      },

      // 用例新增/编辑临时数据
      tempCase: {},

      // 项目列表数据
      project_list: [],

      // 模块列表数据
      module_list: [],

      // 用户列表
      user_list: [],

      // 用例数据列表
      apis: {
        api_total: 0,
        api_list: [],
        currentPage: undefined,
        currentApi: undefined
      },

      // dialog框状态，edit为编辑数据, create为新增数据
      caseDialogStatus: ''

    }
  },

  created() {
    // 初始化用户列表
    this.getUserList()
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

    // 双击进入编辑用例，把被点击的用例信息赋值给临时用例模板
    doubleClick(row, column, event) {
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
    delCase(api_id) {
      // console.log('delCase: ', api_id)
      deleteCase({'id': api_id}).then(response => {
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
      caseRun({
        'caseName': caseData.name,
        'caseIds': [caseData.id],
        'projectId': caseData.project_id
      }).then(response => {
        // console.log('case.index.methods.runCase.response: ', JSON.stringify(response))
        this.openReportById(response.data.report_id)
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
      this.listLoading = true
      caseList({
        'caseSetId': this.currentCaseSet.id,
        'pagNum': this.defaultPage.pageNum,
        'pageSize': this.defaultPage.apiPageSize
      }).then(response => {
        this.apis.api_list = response.data.data
        this.apis.api_total = response.data.total
      })
      this.listLoading = false
    }
  },

  computed: {
    // 用例列表能用的宽度
    caseSetListTableWidth() {
      return `${window.innerWidth - 700}px`
    }
  },

  watch: {

    // 监听父组件传过来的当前选中的用例集，实时获取父组件传过来的用例集对应下的用例列表
    'currentCaseSet': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.getCaseList({
          'caseSetId': newVal.id,
          'pagNum': this.defaultPage.pageNum,
          'pageSize': this.defaultPage.apiPageSize
        })
      }
    },

  }
}
</script>

<style>

</style>
