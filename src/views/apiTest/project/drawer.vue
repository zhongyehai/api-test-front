<template>
  <div>
    <el-drawer
      :title="tempProject.id ? '修改服务' : '新增服务'"
      size="70%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <div class="demo-drawer__content">

        <div style="margin-left: 20px">

          <el-tabs v-model="activeName" :before-leave="beforeLeave">
            <el-tab-pane label="服务信息" name="info">
              <el-form ref="dataForm" :model="tempProject" label-width="100px"
                       style="min-width: 200px;margin-left: 20px;margin-right: 20px">
                <el-form-item :label="'服务名'" prop="name" size="mini" class="is-required">
                  <el-input v-model="tempProject.name"/>
                </el-form-item>

                <el-form-item :label="'负责人'" prop="manager" size="mini" class="is-required">
                  <userSelector ref="userSelect" :user="tempProject.manager"></userSelector>
                </el-form-item>
                <el-form-item :label="'swagger地址'" prop="swagger" class="filter-item" size="mini">
                  <el-input
                    v-model="tempProject.swagger"
                    style="width: 98%"
                    placeholder="当前服务的swagger地址，用于拉取模块、接口数据"/>
                  <el-popconfirm
                    placement="top"
                    hide-icon
                    title="若此处填写了对应的swagger地址，则只需要回到列表页点击同步按钮，系统会自动获取swagger数据，并把其中的模块、接口同步到测试平台，无需手动录入">
                    <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
                  </el-popconfirm>
                </el-form-item>
              </el-form>
              <div style="text-align: right; margin-right: 10px">
                <el-button
                  v-show="submitButtonIsShow"
                  type="primary"
                  size="mini"
                  @click="tempProject.id ? changProject() : addProject() "
                  :loading="submitButtonIsLoading"
                >{{ tempProject.id ? '保存服务信息' : '新增服务信息' }}
                </el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane :label="value" :name="key" v-for="(value, key, index) in envMapping">
              <envEditor
                :ref="key"
                :currentEnv="key"
                :currentEnvName="value"
                :funcFilesList="funcFilesList"
                :currentProjectId="tempProject.id"
              ></envEditor>
            </el-tab-pane>

          </el-tabs>
        </div>

        <div class="demo-drawer__footer">
          <!-- 同步环境信息 -->
          <el-button
            v-if="tempProject.id"
            type="primary"
            size="mini"
            @click="showEnvSynchronizer()"
          >{{ '同步环境信息' }}
          </el-button>
        </div>
      </div>
      <envSynchronizer></envSynchronizer>
    </el-drawer>
  </div>
</template>

<script>
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import userSelector from "@/components/Selector/user";
import envEditor from "@/views/apiTest/project/envEditor";
import envSynchronizer from "@/views/apiTest/project/envSynchronizer";

import {postProject, putProject} from '@/apis/apiTest/project'
import {funcFileList} from "@/apis/apiTest/funcFile";

export default {
  name: 'drawer',
  props: [
    'currentProject',
    'currentUserList'
  ],
  components: {
    headersView,
    variablesView,
    userSelector,
    envEditor,
    envSynchronizer
  },
  data() {
    return {
      drawerIsShow: false,  // 抽屉的显示状态
      direction: 'rtl',  // 抽屉打开方式
      activeName: 'info',

      // 临时数据，添加、修改
      tempProject: {
        id: null,
        name: null,
        manager: null,
        swagger: '',
        create_user: null
      },

      // 环境映射
      envMapping: {
        "dev": "开发环境",
        "test": "测试环境",
        "uat": "uat环境",
        "production": "生产环境",
      },
      user_list: [],  // 用户列表
      funcFilesList: [],
      submitButtonIsLoading: false,
      submitButtonIsShow: true,
      infoCopy: {}
    }
  },

  methods: {

    /* 点击切换tab
    * activeName：要去的标签页
    * oldActiveName：当前的标签页
    * */
    beforeLeave(activeName, oldActiveName) {
      if (!this.tempProject.id && activeName !== 'info') {
        this.$notify.error('请先保存服务信息')
        return false
      } else if (oldActiveName === 'info') {
        // 对比服务信息是否改变
        if (this.infoCopy.name !== this.tempProject.name ||
          this.infoCopy.manager !== this.$refs.userSelect.tempData ||
          this.infoCopy.swagger !== this.tempProject.swagger) {
          this.$notify.error('请先保存当前服务信息的修改')
          return false
        }
        this.$bus.$emit(this.$busEvents.clickProjectEnv, this.tempProject.id, activeName)
      } else if (oldActiveName !== 'info') {
        let ref = this.$refs[oldActiveName][0]
        if (ref.initData.host !== ref.tempEnv.host ||
          JSON.stringify(ref.initData.headers) !== JSON.stringify(ref.tempEnv.headers) ||
          JSON.stringify(ref.initData.func_files) !== JSON.stringify(ref.$refs.funcFiles.tempFuncFiles) ||
          JSON.stringify(ref.initData.variables) !== JSON.stringify(ref.tempEnv.variables)) {
          this.$notify.error('请先保存当前环境的修改')
          return false
        }
        this.$bus.$emit(this.$busEvents.clickProjectEnv, this.tempProject.id, activeName)
      } else {
        this.$bus.$emit(this.$busEvents.clickProjectEnv, this.tempProject.id, activeName)
      }
    },

    // 点击同步信息
    showEnvSynchronizer() {
      this.$bus.$emit(this.$busEvents.showEnvSynchronizer, this.tempProject.id)
    },

    // 获取自定义函数列表
    getFuncFileList() {
      funcFileList().then(response => {
        this.funcFilesList = response.data.data
      })
    },

    // 初始化临时服务数据 (新增)
    initTempProject() {
      this.tempProject = {
        id: null,
        name: null,
        manager: null,
        swagger: ''
      }
      this.submitButtonIsShow = true
    },

    // 初始化临时服务数据 (修改)
    updateTempProject(row) {
      this.infoCopy = JSON.parse(JSON.stringify(row))
      this.tempProject.id = row.id
      this.tempProject.name = row.name
      this.tempProject.manager = row.manager
      this.tempProject.swagger = row.swagger
      this.submitButtonIsShow = true
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      return {
        id: this.tempProject.id,
        name: this.tempProject.name,
        manager: this.$refs.userSelect.tempData,
        swagger: this.tempProject.swagger
      }
    },

    // 新增服务
    addProject() {
      this.submitButtonIsLoading = true
      postProject(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.infoCopy = JSON.parse(JSON.stringify(response.data))
          this.tempProject.id = response.data.id
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
          this.infoCopy = JSON.parse(JSON.stringify(response.data))
          this.sendIsCommitStatus()
        }
      })
    },

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求服务列表
    sendIsCommitStatus() {
      this.$bus.$emit(this.$busEvents.projectDialogCommitSuccess, 'success')
    },

  },

  mounted() {

    this.getFuncFileList()

    this.$bus.$on(this.$busEvents.showProjectDialog, (status, data) => {
      this.activeName = 'info'
      if (status === 'add') {
        this.initTempProject()  // 新增
      } else if (status === 'edit') {
        this.updateTempProject(data)  // 修改
      }
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
