<template>
  <el-drawer
    :title=" tempTask.id ? '修改定时任务' : '新增定时任务'"
    size="60%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <el-form label-width="100px" style="margin-left: 20px;margin-right: 20px">

      <el-tabs v-model="activeName">
        <el-tab-pane label="任务信息" name="taskInfo">
          <el-form-item label="任务名称" size="mini" class="is-required">
            <el-input v-model="tempTask.name" auto-complete="off">
            </el-input>
          </el-form-item>
          <!-- 服务选择 -->
          <el-col :span="12">
            <el-tooltip class="item" effect="dark" placement="top-end">
              <div slot="content">若没有选择用例集，则默认运行此服务下的所有用例</div>
              <el-form-item label="选择服务" class="is-required">
                <el-select
                  v-model="projectSelectedId"
                  placeholder="请选择服务"
                  size="mini"
                  filterable
                  default-first-option
                  style="width: 100%"
                  :disabled="true"
                >
                  <el-option v-for="(item) in projectLists" :key="item.id" :label="item.name"
                             :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-tooltip>
          </el-col>

          <!-- 选择环境 -->
          <el-col :span="12">
            <el-tooltip class="item" effect="dark" placement="top-end">
              <div slot="content">
                请确保此定时任务中选中的用例涉及到的所有服务都配置了当前选中环境的域名 <br/>
                如：选测试环境，则需确保此定时任务中选中的用例涉及到的所有服务都配置了测试环境的域名
              </div>
              <el-form-item label="选择环境" class="is-required">
                <environmentSelectorView
                  :choice_environment="tempTask.choice_host"
                  ref="environmentSelectorView"
                ></environmentSelectorView>
              </el-form-item>
            </el-tooltip>
          </el-col>

          <el-form-item label="发送报告" class="is-required">
            <el-radio v-model="tempTask.is_send" label="1">不发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="2">始终发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="3">仅有不通过用例时发送</el-radio>
          </el-form-item>

          <el-form-item v-show="tempTask.is_send !== '1'" class="is-required" label="接收方式">
            <el-radio v-model="tempTask.send_type" label="all">都接收</el-radio>
            <el-radio v-model="tempTask.send_type" label="we_chat">仅企业微信群</el-radio>
            <el-radio v-model="tempTask.send_type" label="ding_ding">仅钉钉群</el-radio>
            <el-radio v-model="tempTask.send_type" label="email">仅邮件</el-radio>
            <div v-show="tempTask.send_type === 'we_chat'">
              <el-form-item label="机器人地址" class="is-required">
                <el-input
                  type="textarea"
                  size="mini"
                  autosize
                  v-model="tempTask.we_chat"
                  placeholder="企业微信机器人地址"></el-input>
              </el-form-item>
            </div>
            <div v-show="tempTask.send_type === 'ding_ding'">
              <el-form-item label="机器人地址" class="is-required">
                <el-input
                  type="textarea"
                  size="mini"
                  autosize
                  v-model="tempTask.ding_ding"
                  placeholder="钉钉机器人地址"></el-input>
              </el-form-item>
            </div>
            <div v-show="tempTask.send_type === 'email'">
              <el-form-item label="邮箱服务器" class="is-required">
                <emailServerSelector
                  ref="emailServerSelector"
                  :oldEmailServer="tempTask.email_server"></emailServerSelector>
              </el-form-item>
              <el-form-item label="发件人邮箱" class="is-required">
                <el-input
                  v-model="tempTask.email_from"
                  size="mini"
                  placeholder="默认支持QQ邮箱，可到全局参数添加对应的服务器，配置类型选邮箱">
                </el-input>
              </el-form-item>
              <el-form-item label="邮箱密码" prop="desc" class="is-required">
                <el-input
                  v-model="tempTask.email_pwd"
                  size="mini"
                  type="text">
                </el-input>
              </el-form-item>
              <el-form-item label="收件人邮箱" class="is-required">
                <el-input
                  type="textarea"
                  autosize
                  size="mini"
                  v-model="tempTask.email_to"
                  placeholder="收件人邮箱，多个时用英文的 分号 “ ; ” 分隔"
                ></el-input>
              </el-form-item>
            </div>
          </el-form-item>

          <el-form-item label="时间配置" size="mini" class="is-required">
            <el-input v-model="tempTask.cron" style="width: 80%"
                      placeholder="秒 分 时 日 月 周 年 (0 0 12 * * ? * 每天中午12点触发)">
            </el-input>
            <el-link type="primary" href="https://www.bejson.com/othertools/cron/" target="_blank"
                     style="width: 20%">
              调试cron表达式
            </el-link>
          </el-form-item>
        </el-tab-pane>


        <el-tab-pane label="配置任务用例" name="case">
          {{ tempTask.case_id }}
          <div style="margin-bottom: 20px">
            <span style="color: red">注：</span><br>
            1、若没有选择用例集和用例，则默认运行当前服务下的所有用例集下的所有用例<br>
            2、若要选择用例集下的所有用例，则勾选对应的用例集即可，无需再选择用例<br>
            3、若要选择用例，则点击对应的用例集获取用例列表，再在用例列表中勾选要选择的用例
          </div>
          <el-row>
            <!--            <el-col :span="6">-->
            <el-col style="width: 25%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
              <el-tabs v-model="caseSetTab">
                <el-tab-pane label="用例集列表" name="caseSetTab">
                  <el-tree
                    ref="setTree"
                    class="setTree"
                    :data="tempCaseSetList"
                    show-checkbox
                    node-key="id"
                    check-strictly
                    :default-expanded-keys="tempTask.set_id"
                    :default-checked-keys="tempTask.set_id"
                    :props="defaultProps"
                    @node-click="clickTree"
                  >
                  </el-tree>
                </el-tab-pane>
              </el-tabs>
            </el-col>

            <el-col :span="18">
              <el-tabs v-model="caseTab" style="margin-left: 5px">
                <el-tab-pane label="用例列表" name="caseTab">
                  <el-table
                    ref="multipleTable"
                    :data="currentCaseList"
                    tooltip-effect="dark"
                    style="width: 100%"
                    @select="selectRow"
                    @select-all="selectAll">
                    <el-table-column
                      type="selection"
                      width="55">
                    </el-table-column>

                    <el-table-column
                      prop="name"
                      label="用例名"
                      show-overflow-tooltip>
                    </el-table-column>

                    <el-table-column prop="is_run" label="是否执行">
                      <template slot-scope="scope">
                        <el-switch
                          :disabled="true"
                          v-model="scope.row.is_run"
                        ></el-switch>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>

    </el-form>

    <div class="demo-drawer__footer">
      <el-button @click="drawerIsShow = false" size="mini">取 消</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click.native="tempTask.id ? updateTask() : createTask()"
      >确定
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import environmentSelectorView from "@/components/Selector/environment";
import emailServerSelector from "@/components/Selector/email";

import {postTask, putTask} from '@/apis/apiTest/task'
import {caseSetList} from "@/apis/apiTest/caseSet";
import {caseList} from '@/apis/apiTest/case'
import {arrayToTree} from "@/utils/parseData";

export default {
  name: "drawer",
  components: {
    environmentSelectorView,
    emailServerSelector
  },
  data() {
    return {

      activeName: 'taskInfo',
      caseTab: 'caseTab',
      caseSetTab: 'caseSetTab',

      defaultProps: {
        children: 'children',
        label: 'name'
      },
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      drawerIsShow: false,
      tempTask: {},

      projectLists: '',  // 服务列表
      projectSelectedId: '',  // 服务选择框选择的服务id

      tempCaseSetList: [],  // 当前选中服务下的用例集列表
      currentCaseList: [],  // 当前选中模块下的用例列表

      currentTreeDataId: ''
    }
  },
  methods: {

    // 执行列表默认勾选，遍历用例列表，如果用例的id在task.case_id里面，则把这行标为选中状态
    defaultClick() {
      this.$nextTick(() => {
        this.currentCaseList.forEach(caseRow => {
          if (this.tempTask.case_id.indexOf(caseRow.id) >= 0) {
            this.$refs.multipleTable.toggleRowSelection(caseRow, true)
          }
        })
      })
    },

    // 点击用例集树，获取用例列表
    clickTree(data, node, element) {
      if (this.currentTreeDataId !== data.id) {
        this.getCaseList(data.id)
        this.currentTreeDataId = data.id
      }
    },

    // 列表勾选事件，如果勾选的数据在列表里面，就去掉此数据，如果不在，就添加
    selectRow(selection, row) {
      let index = this.tempTask.case_id.indexOf(row.id)
      index >= 0 ? this.tempTask.case_id.splice(index, 1): this.tempTask.case_id.push(row.id)
    },

    // 全选或者全部取消
    selectAll(selection) {
      if (selection.length > 0){  // 全选
        selection.forEach(row =>{
          if (this.tempTask.case_id.indexOf(row.id) < 0){
            this.tempTask.case_id.push(row.id)
          }
        })
      }else {
        this.currentCaseList.forEach(row => {  // 全部取消
          let index = this.tempTask.case_id.indexOf(row.id)
          if (index >= 0){
            this.tempTask.case_id.splice(index, 1)
          }
        })
      }
    },

    // 获取服务id对应的用例集列表
    getCaseSetByProjectId(project_id) {
      caseSetList({'projectId': project_id}).then(response => {
        var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data.data
        this.tempCaseSetList = arrayToTree(response_data, null)
      })
    },

    // 获取当前模块下的用例列表
    getCaseList(setId) {
      caseList({setId: setId}).then(response => {
        this.currentCaseList = response.data.data
        this.defaultClick()  // 获取完用例列表过后 ，执行默认选中事件
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
        send_type: 'ding_ding',
        we_chat: '',
        ding_ding: '',
        email_server: '',
        email_to: '',
        email_from: '',
        email_pwd: '',
        set_id: [],
        case_id: [],
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
        we_chat: this.tempTask.we_chat,
        ding_ding: this.tempTask.ding_ding,
        email_server: this.$refs.emailServerSelector.tempEmailServer,
        email_to: this.tempTask.email_to,
        email_from: this.tempTask.email_from,
        email_pwd: this.tempTask.email_pwd,
        project_id: this.tempTask.project_id,
        set_id: this.$refs.setTree.getCheckedKeys(),
        case_id: this.tempTask.case_id,
      }
    },

    // 定时任务编辑框提交成功事件
    busEmit() {
      this.drawerIsShow = false
      this.$bus.$emit(this.$busEvents.taskDialogIsCommit, 'success')
    },

    // 创建定时任务
    createTask() {
      this.submitButtonIsLoading = true
      postTask(this.getTaskToCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.busEmit()
        }
      })
    },

    // 修改定时任务
    updateTask() {
      this.submitButtonIsLoading = true
      putTask(this.getTaskToCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.busEmit()
        }
      })
    }
  },

  mounted() {

    // 服务树选中项事件
    this.$bus.$on(this.$busEvents.projectTreeChoiceProject, (project, project_list) => {
      this.projectLists = project_list  // 当前服务所在的服务列表
      if (project.id !== this.projectSelectedId) {  // 如果服务变了，则把已选中模块置为''
        this.tempTask.set_id = []
      }
      this.projectSelectedId = project.id  // 当前选中的服务
    })

    // 监听服务树菜单点击事件
    this.$bus.$on(this.$busEvents.taskDialogIsShow, (status, taskOrProject) => {
      if (status === 'update') {  // 修改
        this.tempTask = taskOrProject
      } else {  // 新增
        this.initNewTask()
        this.tempTask.project_id = taskOrProject.id
      }
      this.drawerIsShow = true

      // 获取当前服务对应的用例集列表
      this.getCaseSetByProjectId(this.projectSelectedId)
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
    this.$bus.$off(this.$busEvents.taskDialogIsShow)
  }
}
</script>

<style scoped>
.setTree {
  /*width: 80%;*/
  /*height: 60%;*/
  /*overflow: scroll;*/
}


.collapse_title {
  /*text-align: right;*/
  vertical-align: middle;
  /*float: left;*/
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  /*line-height: 40px;*/
  /*padding: 0 12px 0 0;*/
  /*-webkit-box-sizing: border-box;*/
  box-sizing: border-box;
}
</style>
