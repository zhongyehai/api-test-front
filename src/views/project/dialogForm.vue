<template>
  <div>

    <!-- 新增/修改表单 -->
    <el-dialog
      :title=" dialogStatus === 'add' ? '新增项目' : '修改项目'"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      width="60%"
    >
      <el-form ref="dataForm"
               :model="tempProject"
               :rules="rules"
               label-position="left"
               label-width="70px"
               style="min-width: 400px;"
      >

        <!-- 项目信息 -->
        <el-tabs>
          <el-tab-pane label="项目信息">
            <el-form-item :label="'项目名'" prop="name" class="filter-item" size="mini">
              <el-input v-model="tempProject.name"/>
            </el-form-item>

            <el-form-item :label="'负责人'" prop="manager" class="filter-item" size="mini">
              <userSelector ref="userSelector" :user="tempProject.manager"></userSelector>
            </el-form-item>

            <!-- 函数文件 -->
            <el-form-item label="函数文件" prop="func_files" class="filter-item" labelWidth="70px" size="mini">
              <funcFileView ref="funcFiles" :funcFiles="tempProject.func_files"></funcFileView>
            </el-form-item>

            <!-- 环境地址 -->
            <el-tabs type="card">
              <el-tab-pane label="域名" prop="hosts">
                <hostRowView ref="hostRowView" :host-list="tempProject.hosts"></hostRowView>
              </el-tab-pane>
            </el-tabs>
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
        <el-button type="primary" size="mini" @click=" dialogStatus === 'add' ? addProject() : changProject() ">
          {{ '确定' }}
        </el-button>
      </div>

    </el-dialog>

  </div>
</template>

<script>
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import hostRowView from '@/components/Inputs/hostRow'
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
    userSelector,
    hostRowView
  },
  data() {
    return {

      // 临时数据，添加、修改
      tempProject: {
        id: null,
        name: null,
        manager: null,
        hosts: [{'value': ''}],
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

      // 校验规则
      rules: {
        name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        // manager: [{ required: true, message: '请选择负责人', trigger: 'blur' }],
        hosts: [{ required: true, message: '请输入项目域名', trigger: 'blur' }]
      }
    }
  },

  methods: {
    // 初始化临时项目数据 (新增)
    initTempProject() {
      this.tempProject = {
        id: null,
        name: null,
        manager: null,
        hosts: [{'value': ''}],
        variables: [{'key': null, 'value': null, 'remark': null}],
        headers: [{'key': null, 'value': null, 'remark': null}],
        func_files: []
      }
    },

    // 初始化临时项目数据 (修改)
    updateTempProject(row) {
      this.tempProject.id = row.id
      this.tempProject.name = row.name
      this.tempProject.manager = row.manager
      this.tempProject.hosts = this.hostListToDict(row.hosts)
      this.tempProject.variables = row.variables
      this.tempProject.headers = row.headers
      this.tempProject.func_files = row.func_files
    },

    // 把[xxx1,xxx2] 转为 [{value:xxx1},{value:xxx2}]，用于将后端数据转为前端能渲染的格式
    hostListToDict(data) {
      let host_list = Array()
      if (!data) {
        return host_list
      }
      for (let i = 0; i < data.length; i++) {
        host_list.push({value: data[i]})
      }
      return host_list
    },

    // 把[{value:xxx1},{value:xxx2}] 转为 [xxx1,xxx2]，用于将前端数据转为后端能解析的格式
    hostDictToList(data) {
      let host_list = Array()
      for (let i = 0; i < data.length; i++) {
        if (data[i].value) {
          host_list.push(data[i].value)
        }
      }
      return host_list
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      return {
        id: this.tempProject.id,
        name: this.tempProject.name,
        manager: this.$refs.userSelector.tempData,
        hosts: this.hostDictToList(this.$refs.hostRowView.tempData),
        variables: this.tempProject.variables,
        headers: this.tempProject.headers,
        func_files: this.$refs.funcFiles.tempFuncFiles
      }
    },

    // 新增项目
    addProject() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          postProject(this.getProjectForCommit()).then(response => {
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

    // 修改项目
    changProject() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          putProject(this.getProjectForCommit()).then(response => {
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

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求项目列表
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
