<template>
  <div>

    <!-- 新增/修改表单 -->
    <el-dialog
      :title=" dialogStatus === 'add' ? '新增服务' : '修改服务'"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      width="60%"
    >
      <el-form ref="dataForm"
               :model="tempProject"
               :rules="rules"
               label-width="100px"
               style="min-width: 200px;"
      >

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
            <el-form-item label="函数文件" prop="func_files" size="mini">
              <funcFileView ref="funcFiles" :funcFiles="tempProject.func_files"></funcFileView>
            </el-form-item>

            <!-- 开发环境 -->
            <el-form-item :label="'开发环境'" prop="dev" class="filter-item" size="mini">
              <el-input v-model="tempProject.dev"  placeholder="开发环境域名，100位以内"/>
            </el-form-item>

            <!-- 测试环境 -->
            <el-form-item :label="'测试环境'" prop="test" class="filter-item is-required" size="mini">
              <el-input v-model="tempProject.test"  placeholder="测试环境域名，必填，100位以内"/>
            </el-form-item>

            <!-- uat环境 -->
            <el-form-item :label="'uat环境'" prop="dev" class="filter-item" size="mini">
              <el-input v-model="tempProject.uat"  placeholder="uat环境域名，100位以内"/>
            </el-form-item>

            <!-- 生产环境 -->
            <el-form-item :label="'生产环境'" prop="production" class="filter-item" size="mini">
              <el-input v-model="tempProject.production" placeholder="生产环境域名，100位以内"/>
            </el-form-item>
          </el-tab-pane>

          <!-- 公用变量 -->
          <el-tab-pane label="公用变量">
            <variablesView :currentData="tempProject.variables"></variablesView>
          </el-tab-pane>

          <!-- 头部信息 -->
          <el-tab-pane label="头部信息">
            <headersView :currentData="tempProject.headers"></headersView>
          </el-tab-pane>

        </el-tabs>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false"> {{ '取消' }}</el-button>
        <el-button
          type="primary"
          size="mini"
          @click=" dialogStatus === 'add' ? addProject() : changProject() "
          :loading="submitButtonIsLoading"
        >
          {{ '确定' }}
        </el-button>
      </div>

    </el-dialog>

  </div>
</template>

<script>
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import funcFileView from '@/components/Selector/funcFile'
import userSelector from "@/components/Selector/user";

import {postProject, putProject} from '@/apis/project'

export default {
  name: 'projectDialogView',
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

      // 临时数据，添加、修改
      tempProject: {
        id: null,
        name: null,
        manager: null,
        dev: '',
        test: '',
        uat: '',
        production: '',
        variables: [{'key': null, 'value': null, 'remark': null}],
        headers: [{'key': null, 'value': null, 'remark': null}],
        func_files: [],
        create_user: null
      },

      // 用户列表
      user_list: [],

      // 编辑框的显示状态
      dialogFormVisible: false,

      // dialog框状态，edit为编辑数据, create为新增数据
      dialogStatus: '',

      submitButtonIsLoading: false,

      // 校验规则
      rules: {
        name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
        manager: [
          // { required: true, message: '请选择负责人', trigger: 'blur' },
          // {
          //   validator: (rule, value, callback) => {
          //     if (!value) {
          //       callback('请选择负责人');
          //     } else {
          //       callback();
          //     }
          //   },
          //   trigger: 'change',
          // }
        ],
        // test: [{ required: true, message: '测试环境域名必填', trigger: 'blur' }],
      }
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
        variables: this.tempProject.variables,
        headers: this.tempProject.headers,
        func_files: this.$refs.funcFiles.tempFuncFiles
      }
    },

    // 新增服务
    addProject() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.submitButtonIsLoading = true
          postProject(this.getProjectForCommit()).then(response => {
            this.submitButtonIsLoading = false
            if (this.showMessage(this, response)) {
              this.dialogFormVisible = false
              this.sendIsCommitStatus()
            }
          })
        } else {
          this.$message.error('请确认规则')
        }
      });
    },

    // 修改服务
    changProject() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.submitButtonIsLoading = true
          putProject(this.getProjectForCommit()).then(response => {
            this.submitButtonIsLoading = false
            if (this.showMessage(this, response)) {
              this.dialogFormVisible = false
              this.sendIsCommitStatus()
            }
          })
        } else {
          this.$message.error('请确认规则')
        }
      });
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
      this.dialogStatus = status
      this.dialogFormVisible = true
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
