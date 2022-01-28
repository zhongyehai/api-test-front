<template>
  <el-drawer
    :title=" drawerType === 'update' ? '修改定时任务' : '新增定时任务'"
    size="50%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <el-form label-width="100px" style="margin-left: 20px;margin-right: 20px">
      <el-row>
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
      </el-row>

      <el-row>

        <!-- 选则用例集 -->
        <el-col :span="12">
          <el-tooltip class="item" effect="dark" placement="top-end">
            <div slot="content">
              若要运行单个或多个用例集下的所有用例，则只需要选择对应的用例集即可，无需选择用例<br/>
              若选择了多个用例集，则不能选择指定用例<br/>
              若选择了多个用例集，但不想运行某些用例，则需要到用例管理，将对应的用例设为不运行即可
            </div>
            <el-form-item label="选则用例集">
              <el-cascader
                size="mini"
                style="width: 100%"
                v-model="tempTaskSet"
                :options="tempCaseSetList"
                :props="{ multiple: true, checkStrictly: true }"
                @change="selectedCaseSet"
                clearable></el-cascader>
            </el-form-item>
          </el-tooltip>
        </el-col>

        <!-- 选则用例 -->
        <el-col :span="12">
          <el-tooltip class="item" effect="dark" placement="top-end">
            <div slot="content">若指定了要运行的单个或多个用例，则定时任务触发时，只运行此处选中的用例</div>
            <el-form-item label="选择用例" size="mini">
              <el-select
                v-model="tempTask.case_id"
                multiple
                placeholder="选择用例"
                value-key="id"
                :disabled="caseSelectorIsDisabled"
                style="width: 100%"
                size="mini"
              >
                <el-option v-for="item in currentCaseList" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-tooltip>
        </el-col>
      </el-row>

      <el-form-item label="任务名称" size="mini" class="is-required">
        <el-input v-model="tempTask.name" auto-complete="off">
        </el-input>
      </el-form-item>

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

    </el-form>

    <div class="demo-drawer__footer">
      <el-button @click="drawerIsShow = false" size="mini">取 消</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click.native="drawerType === 'update' ? updateTask() : createTask()"
      >确定
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import environmentSelectorView from "@/components/Selector/environment";
import emailServerSelector from "@/components/Selector/email";

import {postTask, putTask} from '@/apis/task'
import {caseSetList} from "@/apis/caseSet";
import {caseList} from '@/apis/case'

export default {
  name: "drawer",
  components: {
    environmentSelectorView,
    emailServerSelector
  },
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      drawerIsShow: false,
      drawerType: '',
      tempTask: {},

      projectLists: '',  // 服务列表
      projectSelectedId: '',  // 服务选择框选择的服务id

      currentSelectedCaseSet: [],

      tempCaseSetList: [],  // 当前选中服务下的用例集列表
      tempTaskSet: [],  // 解析后带目录的已选中用例集列表[[1,3,5], [4,5]]

      caseSelectorIsDisabled: false,  // 用例选择框是否只读
      currentCaseList: [],  // 当前选中模块下的用例列表
    }
  },
  methods: {

    // 用例集下拉框选中事件
    selectedCaseSet(selectedCaseSetList) {
      this.currentSelectedCaseSet = selectedCaseSetList

      if (selectedCaseSetList.length === 1) {
        this.getCaseList(selectedCaseSetList.slice(-1)[0].slice(-1)[0])
      } else {
        // 选中多个用例集，或者没有选中用例集
        this.tempTask.case_id = []  // 清空选中用例列表
        this.currentCaseList = []  // 清空用例列表
      }
    },

    // 递归把列表转为树行结构
    arrayToTree(arr, parentId) {
      //  arr 是返回的数据  parendId 父id
      let temp = [];
      let treeArr = arr;
      treeArr.forEach((item, index) => {
        if (item.parent == parentId) {
          if (this.arrayToTree(treeArr, treeArr[index].id).length > 0) {
            // 递归调用此函数
            treeArr[index].children = this.arrayToTree(treeArr, treeArr[index].id);
          }
          treeArr[index].value = treeArr[index].id
          treeArr[index].label = treeArr[index].name
          temp.push(treeArr[index]);
        }
      });
      return temp;
    },

    // 获取服务id对应的用例集列表
    getCaseSetByProjectId(project_id) {
      var that = this
      caseSetList({'projectId': project_id}).then(response => {
        // 赋值给级联选中框
        // this.tempCaseSetList = this.arrayToTree(response.data.data, null)
        this.tempCaseSetList = response.data.data ? this.arrayToTree(response.data.data, null) : []


        // 遍历取当前用例集的父用例集
        // 遍历已选中的用例集
        for (let index in this.tempTask.set_id) {
          if (this.tempTask.set_id[index]) {  // 有值才执行后面的逻辑
            var currentDataList = []
            currentDataList.unshift(this.tempTask.set_id[index])

            let currentData = {}
            // 第一次循环，获取当前用例集id本身的数据（主要是获取parentId）
            for (let setIndex in response.data.data) {
              // 获取当前用例集id本身的数据（主要是获取parentId）
              if (this.tempTask.set_id[index] === response.data.data[setIndex].id) {
                currentData = response.data.data[setIndex]
                break
              }
            }

            // 循环所有用例集，组建关系
            while (true) {
              // 如果没有parent_id，就不再循环
              if (currentData.parent === null) {
                break
              }
              for (let setIndex in response.data.data) {
                // 获取当前用例集id本身的数据（主要是获取parentId）
                if (currentData.parent === response.data.data[setIndex].id) {
                  currentData = response.data.data[setIndex]
                  currentDataList.unshift(response.data.data[setIndex].id)
                  break
                }
              }
            }
            that.tempTaskSet.push(currentDataList)
          }
        }
      })
    },

    // 获取当前模块下的用例列表
    getCaseList(setId) {
      caseList({setId: setId}).then(response => {
        this.currentCaseList = response.data.data
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
        case_id: '',
        project_id: ''
      }
    },

    // 获取当前数据，用于提交
    getTaskToCommit() {
      let caseSetList = []
      for (let index in this.currentSelectedCaseSet) {
        if (this.currentSelectedCaseSet[index].length > 0) {
          caseSetList.push(this.currentSelectedCaseSet[index].slice(-1)[0])
        }
      }
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
        set_id: caseSetList,
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
        this.tempTask.set_id = ''
      }
      this.projectSelectedId = project.id  // 当前选中的服务
    })

    // 监听服务树菜单点击事件
    this.$bus.$on(this.$busEvents.taskDialogIsShow, (status, taskOrProject) => {
      // this.drawerType = status

      if (status === 'update') {  // 修改
        this.tempTask = taskOrProject
        this.currentSelectedCaseSet = [taskOrProject.set_id]
      } else {  // 新增
        this.initNewTask()
        this.tempTask.project_id = taskOrProject.id
      }
      this.drawerIsShow = true

      // 获取当前服务对应的用例集列表
      // this.tempTaskSet = []
      this.getCaseSetByProjectId(this.projectSelectedId)

      // 初始化时获取当前选择用例集的用例列表
      if (this.tempTask.set_id.length === 1) {
        this.getCaseList(this.tempTask.set_id[0])
      }

      this.drawerType = status
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

</style>
