<template>

  <el-dialog
    :title="dialogStatus === 'update' ? '修改任务' : '新增任务'"
    :visible.sync="taskDialogIsShow"
    :close-on-click-modal="false"
    width="50%">

    <el-tabs>
      <el-tab-pane>
        <el-form>
          <el-form-item label="选则用例" :label-width="labelWidth">

            <!-- 项目选择 -->
            <projectSelector
              ref="projectSelector"
              :isDisabled="true"
              :busEmitEventName="$busEvents.projectSelectorChoiceProject"
              :projectId="tempTask.project_id"
            ></projectSelector>

            <!-- 用例集选择 -->
            <caseSetSelector
              ref="caseSetSelector"
              :isMultiple="true"
              :caseSetId="tempTask.set_id"
              :projectId="tempTask.project_id"
              :isWatchStatus="taskDialogIsShow"
              :busOnEventName="$busEvents.projectTreeChoiceProject"
              :busEmitEventName="$busEvents.caseSetSelectorChoiceCaseSet"
            ></caseSetSelector>

            <!-- 用例选择 -->
            <!--            :caseSetId="$refs.caseSetSelector ? $refs.caseSetSelector.tempCaseSetId : ''"-->
            <caseSelector
              ref="caseSelector"
              :caseIds="tempTask.case_id"
              :caseSetId="tempTask.set_id"
              :busOnEventName="$busEvents.caseSetSelectorChoiceCaseSet"
            ></caseSelector>

          </el-form-item>

          <el-form-item label="任务名称" :label-width="labelWidth" size="small">
            <el-input v-model="tempTask.name" auto-complete="off">
            </el-input>
          </el-form-item>

          <el-form-item label="发送报告" :label-width="labelWidth">
            <el-radio v-model="tempTask.is_send" label="1">不发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="2">始终发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="3">仅有不通过用例时发送</el-radio>
          </el-form-item>

          <el-form-item v-show="tempTask.is_send !== '1'" label="接收报告" :label-width="labelWidth">
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
              <el-form-item label="邮箱服务器" :label-width="labelWidth">
                <emailServerSelector ref="emailServerSelector" :oldEmailServer="tempTask.email_server"></emailServerSelector>
              </el-form-item>
              <el-form-item label="发件人邮箱" :label-width="labelWidth">
                <el-input v-model="tempTask.email_from" placeholder="默认支持QQ邮箱，可到全局参数添加对应的服务器，配置类型选邮箱">
                </el-input>
              </el-form-item>
              <el-form-item label="邮箱密码" :label-width="labelWidth" prop="desc">
                <el-input v-model="tempTask.email_pwd" type="text">
                </el-input>
              </el-form-item>
              <el-form-item label="收件人邮箱" :label-width="labelWidth">
                <el-input
                  type="textarea"
                  :rows="2"
                  v-model="tempTask.email_to"
                  placeholder="收件人邮箱，多个时用英文的 逗号 分隔"
                ></el-input>
              </el-form-item>
            </div>
          </el-form-item>

          <el-form-item label="时间配置" :label-width="labelWidth" size="small">
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
import projectSelector from "@/components/Selector/project";
import caseSetSelector from "@/components/Selector/caseSet";
import caseSelector from "@/components/Selector/case";
import emailServerSelector from "@/components/Selector/email";

import {postTask, putTask} from '@/apis/task'

export default {
  name: "taskDialog",
  components: {
    projectSelector,
    caseSetSelector,
    caseSelector,
    emailServerSelector
  },
  data() {
    return {
      taskDialogIsShow: false,
      labelWidth: '90px',
      dialogStatus: '',
      tempTask: {}
    }
  },
  methods: {
    initNewTask() {
      this.tempTask = {
        id: '',
        num: '',
        name: '',
        task_type: 'cron',
        cron: '',
        is_send: '1',
        send_type: 'webhook',
        webhook: '',
        email_server: '',
        email_to: '',
        email_from: '',
        email_pwd: '',
        set_id: '',
        case_id: '',
        project_id: ''
      }
    },
    getTaskToCommit() {
      return {
        id: this.tempTask.id,
        num: this.tempTask.num,
        name: this.tempTask.name,
        task_type: this.tempTask.task_type,
        cron: this.tempTask.cron,
        is_send: this.tempTask.is_send,
        send_type: this.tempTask.send_type,
        webhook: this.tempTask.webhook,
        email_server: this.$refs.emailServerSelector.tempEmailServer,
        email_to: this.tempTask.email_to,
        email_from: this.tempTask.email_from,
        email_pwd: this.tempTask.email_pwd,
        set_id: this.$refs.caseSetSelector.tempCaseSetId,
        case_id: this.$refs.caseSelector.tempCase,
        project_id: this.tempTask.project_id
      }
    },

    initEditTask(task) {},

    busEmit() {
      this.taskDialogIsShow = false
      this.$bus.$emit(this.$busEvents.taskDialogIsCommit, 'success')
    },

    createTask() {
      postTask(this.getTaskToCommit()).then(response => {
        if (this.showMessage(this, response)) {
          this.busEmit()
        }
      })
    },

    updateTask() {
      putTask(this.getTaskToCommit()).then(response => {
        if (this.showMessage(this, response)) {
          this.busEmit()
        }
      })
    }

  },

  mounted() {
    this.$bus.$on(this.$busEvents.taskDialogIsShow, (status, taskOrProject) => {
      if (status === 'update') {
        this.tempTask = taskOrProject
      } else {
        this.initNewTask()
        this.tempTask.project_id = taskOrProject.id
      }
      this.dialogStatus = status
      this.taskDialogIsShow = true
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.taskDialogIsShow)
  },
}
</script>

<style scoped>

</style>
