<template>

  <el-dialog
    :title="dialogStatus === 'update' ? '修改任务' : '新增任务'"
    :visible.sync="taskDialogIsShow"
    :close-on-click-modal="false"
    width="50%">

    <el-tabs>
      <el-tab-pane>
        <el-form label-width="100px">

          <el-row>

            <!-- 项目选择 -->
            <el-col :span="12">
              <el-form-item label="选择项目" class="is-required">
                <el-select
                  v-model="projectSelectedId"
                  placeholder="请选择项目"
                  size="small"
                  filterable
                  style="min-width: 20%;padding-right:10px"
                  :disabled="true"
                >
                  <el-option v-for="(item) in projectLists" :key="item.id" :label="item.name"
                             :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 选择环境 -->
            <el-col :span="12">
              <el-tooltip class="item" effect="dark" placement="top-end">
                <div slot="content">
                  请确保此定时任务中选中的用例涉及到的所有项目都配置了当前选中环境的域名 <br/>
                  如：选测试环境，则需确保此定时任务中选中的用例涉及到的所有项目都配置了测试环境的域名
                </div>
                <el-form-item label="选择环境" class="is-required">
                  <environmentSelectorView
                    :choice_environment="tempTask.choice_host"
                    ref="environmentSelectorView"
                  ></environmentSelectorView>
                </el-form-item>
              </el-tooltip>
            </el-col>
          </el-row>

          <el-row>

            <!-- 选则模块 -->
            <el-col :span="12">
              <el-form-item label="选则模块">
                <el-select
                  v-model="tempTask.module_id"
                  placeholder="请选择模块"
                  multiple
                  size="small"
                  style="min-width: 20%;padding-right:10px"
                  @change="selectedModule"
                  filterable
                >
                  <el-option v-for="(item) in tempModuleList" :key="item.id" :label="item.name"
                             :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 选则用例 -->
            <el-col :span="12">
              <el-form-item label="选择用例" size="small">
                <el-select
                  v-model="tempTask.case_id"
                  multiple
                  placeholder="选择用例"
                  value-key="id"
                  :disabled="caseSelectorIsDisabled"
                  style="min-width: 20%;padding-right:10px"
                  size="small"
                >
                  <el-option v-for="item in caseList" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="任务名称" size="small" class="is-required">
            <el-input v-model="tempTask.name" auto-complete="off">
            </el-input>
          </el-form-item>

          <el-form-item label="发送报告" class="is-required">
            <el-radio v-model="tempTask.is_send" label="1">不发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="2">始终发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="3">仅有不通过用例时发送</el-radio>
          </el-form-item>

          <el-form-item v-show="tempTask.is_send !== '1'" label="接收报告">
            <el-radio v-model="tempTask.send_type" label="all">都接收</el-radio>
            <el-radio v-model="tempTask.send_type" label="webhook">仅微信群</el-radio>
            <el-radio v-model="tempTask.send_type" label="email">仅邮件</el-radio>
            <div v-show="tempTask.send_type !== 'email'">
              <el-input
                type="textarea"
                v-model="tempTask.webhook"
                placeholder="企业微信或钉钉webhook地址">
              </el-input>
            </div>
            <div v-show="tempTask.send_type !== 'webhook'">
              <el-form-item label="邮箱服务器">
                <emailServerSelector ref="emailServerSelector"
                                     :oldEmailServer="tempTask.email_server"></emailServerSelector>
              </el-form-item>
              <el-form-item label="发件人邮箱">
                <el-input v-model="tempTask.email_from" placeholder="默认支持QQ邮箱，可到全局参数添加对应的服务器，配置类型选邮箱">
                </el-input>
              </el-form-item>
              <el-form-item label="邮箱密码" prop="desc">
                <el-input v-model="tempTask.email_pwd" type="text">
                </el-input>
              </el-form-item>
              <el-form-item label="收件人邮箱">
                <el-input
                  type="textarea"
                  :rows="2"
                  v-model="tempTask.email_to"
                  placeholder="收件人邮箱，多个时用英文的 逗号 分隔"
                ></el-input>
              </el-form-item>
            </div>
          </el-form-item>

          <el-form-item label="时间配置" size="small" class="is-required">
            <el-input v-model="tempTask.cron" style="width: 70%"
                      placeholder="秒 分 时 日 月 周 年 (0 0 12 * * ? * 每天中午12点触发)">
            </el-input>
            <el-link type="primary" href="https://www.bejson.com/othertools/cron/" target="_blank"
                     style="width: 30%">
              调试cron表达式
            </el-link>
          </el-form-item>

        </el-form>
      </el-tab-pane>
    </el-tabs>

    <div slot="footer" class="dialog-footer">
      <el-button @click="taskDialogIsShow = false" size="small">取 消</el-button>
      <el-button type="primary" @click.native="dialogStatus === 'update' ? updateTask() : createTask()" size="small"
      >确定
      </el-button>
    </div>

  </el-dialog>

</template>

<script>
import environmentSelectorView from "@/components/Selector/environment";
import emailServerSelector from "@/components/Selector/email";

import {postTask, putTask} from '@/apis/task'
import {moduleList} from "@/apis/module";
import {caseList} from '@/apis/case'

export default {
  name: "taskDialog",
  components: {
    environmentSelectorView,
    emailServerSelector
  },
  data() {
    return {
      taskDialogIsShow: false,
      dialogStatus: '',
      tempTask: {},

      projectLists: '',  // 项目列表
      projectSelectedId: '',  // 项目选择框选择的项目id

      tempModuleList: '',  // 当前选中项目下的模块列表

      caseSelectorIsDisabled: false,  // 用例选择框是否只读
      caseList: [],  // 当前选中模块下的用例列表

    }
  },
  methods: {

    // 模块下拉框选中事件
    selectedModule(module_id) {
      this.tempTask.case_id = []  // 选中模块，则清空已选中的用例
      this.getCaseList()
    },

    // 获取项目id对应的模块列表
    getModulesByProjectId(project_id) {
      moduleList({'projectId': project_id}).then(response => {
        this.tempModuleList = response.data.data
      })
    },

    // 获取当前模块下的用例列表
    getCaseList() {
      caseList({moduleId: this.tempTask.module_id}).then(response => {
        this.caseList = response.data.data
      })
    },

    // 初始化定时任务
    initNewTask() {
      this.tempTask = {
        id: '',
        num: '',
        name: '',
        choice_host: '',
        task_type: 'cron',
        cron: '',
        is_send: '1',
        send_type: 'webhook',
        webhook: '',
        email_server: '',
        email_to: '',
        email_from: '',
        email_pwd: '',
        module_id: '',
        case_id: '',
        project_id: ''
      }
    },

    // 获取当前数据，用于提交
    getTaskToCommit() {
      return {
        id: this.tempTask.id,
        num: this.tempTask.num,
        name: this.tempTask.name,
        choice_host: this.$refs.environmentSelectorView.current_environment,
        task_type: this.tempTask.task_type,
        cron: this.tempTask.cron,
        is_send: this.tempTask.is_send,
        send_type: this.tempTask.send_type,
        webhook: this.tempTask.webhook,
        email_server: this.$refs.emailServerSelector.tempEmailServer,
        email_to: this.tempTask.email_to,
        email_from: this.tempTask.email_from,
        email_pwd: this.tempTask.email_pwd,
        project_id: this.tempTask.project_id,
        module_id: this.tempTask.module_id,
        case_id: this.tempTask.case_id,
      }
    },

    // 定时任务编辑框提交成功事件
    busEmit() {
      this.taskDialogIsShow = false
      this.$bus.$emit(this.$busEvents.taskDialogIsCommit, 'success')
    },

    // 创建定时任务
    createTask() {
      postTask(this.getTaskToCommit()).then(response => {
        if (this.showMessage(this, response)) {
          this.busEmit()
        }
      })
    },

    // 修改定时任务
    updateTask() {
      putTask(this.getTaskToCommit()).then(response => {
        if (this.showMessage(this, response)) {
          this.busEmit()
        }
      })
    }
  },

  mounted() {

    // 项目树选中项事件
    this.$bus.$on(this.$busEvents.projectTreeChoiceProject, (project, project_list) => {
      this.projectLists = project_list  // 当前项目所在的项目列表
      if (project.id !== this.projectSelectedId) {  // 如果项目变了，则把已选中模块置为''
        this.tempTask.module_id = ''
      }
      this.projectSelectedId = project.id  // 当前选中的项目
    })

    // 监听项目树菜单点击事件
    this.$bus.$on(this.$busEvents.taskDialogIsShow, (status, taskOrProject) => {
      this.dialogStatus = status
      this.taskDialogIsShow = true

      if (status === 'update') {  // 修改
        this.tempTask = taskOrProject
      } else {  // 新增
        this.initNewTask()
        this.tempTask.project_id = taskOrProject.id
      }
      // 获取当前项目对应的模块列表
      this.getModulesByProjectId(this.projectSelectedId)
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
    this.$bus.$off(this.$busEvents.taskDialogIsShow)
  },

  watch: {
    // 监听模块id，当模块id变了过后，清空已选中用例，并重新获取用例id
    'tempTask.module_id':{
        handler(newVal, oldVal) {
          if (oldVal){  // 如果本来就没有已选中模块，则说明可能是修改，则不需要清空已选用例
            this.tempTask.case_id = []
          }

          if (!oldVal && newVal){  // 没有oldVal，有newVal，则说明是初始化修改框
            this.getCaseList()
          }
        }
      },
  }
}
</script>

<style scoped>

</style>
