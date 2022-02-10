<template>
  <div>
    <el-drawer
      :title=" drawerType === 'add' ? '新增服务' : '修改服务'"
      size="60%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <div class="demo-drawer__content">
        <el-form ref="dataForm" :model="tempProject" label-width="100px"
                 style="min-width: 200px;margin-left: 20px;margin-right: 20px">

          <!-- 服务信息 -->
          <el-tabs>
            <el-tab-pane label="服务信息">
              <el-form-item :label="'服务名'" prop="name" size="mini" class="is-required">
                <el-input v-model="tempProject.name"/>
              </el-form-item>

              <el-form-item :label="'负责人'" prop="manager" size="mini" class="is-required">
                <userSelector ref="userSelector" :user="tempProject.manager"></userSelector>
              </el-form-item>

              <!-- 函数文件 -->
              <el-tooltip class="item" effect="dark" placement="top-end">
                <div slot="content">
                  若服务下要用到自定义函数可以在这里统一引用对应的函数文件 <br/>
                  此处引用的函数文件，对于当前服务下的接口、用例均有效
                </div>
                <el-form-item label="函数文件" prop="func_files" size="mini">
                  <funcFileView ref="funcFiles" :funcFiles="tempProject.func_files"></funcFileView>
                </el-form-item>
              </el-tooltip>

              <!-- 开发环境 -->
              <el-form-item :label="'开发环境'" prop="dev" class="filter-item" size="mini">
                <el-input v-model="tempProject.dev" placeholder="开发环境域名，255位以内"/>
              </el-form-item>

              <!-- 测试环境 -->
              <el-form-item :label="'测试环境'" prop="test" class="filter-item is-required" size="mini">
                <el-input v-model="tempProject.test" placeholder="测试环境域名，必填，255位以内"/>
              </el-form-item>

              <!-- uat环境 -->
              <el-form-item :label="'uat环境'" prop="dev" class="filter-item" size="mini">
                <el-input v-model="tempProject.uat" placeholder="uat环境域名，255位以内"/>
              </el-form-item>

              <!-- 生产环境 -->
              <el-form-item :label="'生产环境'" prop="production" class="filter-item" size="mini">
                <el-input v-model="tempProject.production" placeholder="生产环境域名，255位以内"/>
              </el-form-item>

              <!-- swagger地址 -->
              <el-tooltip class="item" effect="dark" placement="top-end">
                <div slot="content">
                  若此处填写了对应的swagger地址，则只需要回到列表页点击同步按钮，系统会自动获取swagger数据，
                  并把其中的模块、接口同步到测试平台，无需手动录入
                </div>
                <el-form-item :label="'swagger地址'" prop="swagger" class="filter-item" size="mini">
                  <el-input v-model="tempProject.swagger" placeholder="当前服务的swagger地址，用于拉取模块、接口数据"/>
                </el-form-item>
              </el-tooltip>
            </el-tab-pane>

            <!-- 公用变量 -->

            <el-tab-pane label="公用变量">
              <el-tooltip class="item" effect="dark" placement="top-end">
                <div slot="content">
                  1、可用此功能设置一些预设值，比如token、账号信息 <br/>
                  2、在此处设置的值，对于此服务下的接口、用例均可直接引用 <br/>
                  3、若此处设置的值key为a，value为1，则只需要在要使用时使用“$a”即可获取到“1” <br/>
                  4、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
                  5、若在用例的公用变量处设置了与此处同样的key，则会以用例处定义的变量覆盖此处的变量
                </div>
                <variablesView
                  :currentData="tempProject.variables"
                  :placeholderKey="'key'"
                  :placeholderValue="'value'"
                  :placeholderDesc="'备注'"
                ></variablesView>
              </el-tooltip>
            </el-tab-pane>


            <!-- 头部信息 -->
            <el-tab-pane label="头部信息">
              <el-tooltip class="item" effect="dark" placement="top-end">
                <div slot="content">
                  1、可用此功能设置当前服务的固定的头部参数，比如token、cookie <br/>
                  2、在此处设置的值，在运行此服务下的接口、用例的时候，会自动加到对应的接口/步骤的头部参数上 <br/>
                  3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
                  4、若在用例的头部参数处设置了与此处同样的key，则会以用例处定义的参数覆盖此处的参数
                </div>
                <headersView
                  :currentData="tempProject.headers"
                  :placeholderKey="'key'"
                  :placeholderValue="'value'"
                  :placeholderDesc="'备注'"
                ></headersView>
              </el-tooltip>
            </el-tab-pane>
          </el-tabs>
        </el-form>

        <div class="demo-drawer__footer">
          <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
            type="primary"
            size="mini"
            @click=" drawerType === 'add' ? addProject() : changProject() "
            :loading="submitButtonIsLoading"
          >{{ '确定' }}
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import funcFileView from '@/components/Selector/funcFile'
import userSelector from "@/components/Selector/user";

import {postProject, putProject} from '@/apis/apiTest/project'

export default {
  name: 'drawer',
  props: [
    'currentProject',
    'currentUserList'
  ],
  components: {
    headersView,
    variablesView,
    funcFileView,
    userSelector
  },
  data() {
    return {

      direction: 'rtl',  // 抽屉打开方式

      // 临时数据，添加、修改
      tempProject: {
        id: null,
        name: null,
        manager: null,
        dev: '',
        test: '',
        uat: '',
        production: '',
        swagger: '',
        variables: [{'key': null, 'value': null, 'remark': null}],
        headers: [{'key': null, 'value': null, 'remark': null}],
        func_files: [],
        create_user: null
      },

      // 用户列表
      user_list: [],

      // 编辑框的显示状态
      drawerIsShow: false,

      // dialog框状态，edit为编辑数据, create为新增数据
      drawerType: '',

      submitButtonIsLoading: false
    }
  },

  methods: {
    // 初始化临时服务数据 (新增)
    initTempProject() {
      this.tempProject = {
        id: null,
        name: null,
        manager: null,
        dev: '',
        test: '',
        uat: '',
        production: '',
        variables: [{'key': null, 'value': null, 'remark': null}],
        headers: [{'key': null, 'value': null, 'remark': null}],
        func_files: []
      }
    },

    // 初始化临时服务数据 (修改)
    updateTempProject(row) {
      this.tempProject.id = row.id
      this.tempProject.name = row.name
      this.tempProject.manager = row.manager
      this.tempProject.dev = row.dev
      this.tempProject.test = row.test
      this.tempProject.uat = row.uat
      this.tempProject.production = row.production
      this.tempProject.swagger = row.swagger
      this.tempProject.variables = row.variables
      this.tempProject.headers = row.headers
      this.tempProject.func_files = row.func_files
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      return {
        id: this.tempProject.id,
        name: this.tempProject.name,
        manager: this.$refs.userSelector.tempData,
        dev: this.tempProject.dev,
        test: this.tempProject.test,
        uat: this.tempProject.uat,
        production: this.tempProject.production,
        swagger: this.tempProject.swagger,
        variables: this.tempProject.variables,
        headers: this.tempProject.headers,
        func_files: this.$refs.funcFiles.tempFuncFiles
      }
    },

    // 新增服务
    addProject() {
      this.submitButtonIsLoading = true
      postProject(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.sendIsCommitStatus()
        }
      })
    },

    // 修改服务
    changProject() {
      this.submitButtonIsLoading = true
      putProject(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.sendIsCommitStatus()
        }
      })
    },

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求服务列表
    sendIsCommitStatus() {
      this.$bus.$emit(this.$busEvents.projectDialogCommitSuccess, 'success')
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.showProjectDialog, (status, data) => {
      if (status === 'add') {
        this.initTempProject()  // 新增
      } else if (status === 'edit') {
        this.updateTempProject(data)  // 修改
      }
      this.drawerType = status
      this.drawerIsShow = true
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.showProjectDialog)
  },

  watch: {

    // 接收并更新父组件传过来的用户列表
    'currentUserList': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.user_list = newVal
      }
    }

  }
}
</script>

<style scoped>

</style>
