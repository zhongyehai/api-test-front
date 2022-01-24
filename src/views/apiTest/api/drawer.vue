<template>
  <div>

    <!-- 新增/修改接口表单 -->
    <el-drawer
      :title=" drawerType === 'update' ? '修改接口' : '新增接口'"
      size="80%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <!-- 接口所属信息 -->
      <el-form :inline="true" style="margin-left: 20px;margin-right: 20px" label-width="100px">

        <el-row>

          <!-- 接口名称 -->
          <el-col :span="10">
            <el-form-item label="接口名称" class="is-required" style="margin-bottom: 5px">
              <el-input v-model="tempApi.name" placeholder="接口名称" size="mini" style="width: 200%">
              </el-input>
            </el-form-item>
          </el-col>

          <!-- 选择环境 -->
          <el-col :span="7">
            <el-form-item label="选择环境" class="is-required" style="margin-bottom: 5px">
              <environmentSelectorView
                :choice_environment="tempApi.choice_host"
                ref="environmentSelectorView"
              ></environmentSelectorView>
            </el-form-item>
          </el-col>

          <!-- 选择模块 -->
          <el-col :span="7">
            <el-form-item label="选择模块" class="is-required" style="margin-bottom: 5px">
              <moduleSelectorView
                ref="moduleSelector"
                :moduleId="tempApi.module_id"
                :projectId="tempApi.project_id"
                :status="drawerIsShow"
                :busOnEventName="$busEvents.projectSelectorChoiceProject"
                :busOnModuleDialogCommit="$busEvents.moduleDialogCommit"
                :busEmitEventName="$busEvents.moduleSelectorChoiceModule"
              ></moduleSelectorView>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 前置条件 -->
        <el-row>
          <el-form-item label="前置条件" prop="up_func" style="margin-bottom: 5px">
            <el-input
              type="textarea"
              autosize
              v-model="tempApi.up_func"
              placeholder="前置处理函数，多个时用英文的 分号 ' ; ' 分隔"
              size="mini"
              style="width: 550%"></el-input>
          </el-form-item>
        </el-row>

        <!-- 后置条件 -->
        <el-row>
          <el-form-item label="后置条件" prop="down_func" style="margin-bottom: 5px">
            <el-input
              type="textarea"
              autosize
              v-model="tempApi.down_func"
              placeholder="后置处理函数，多个时用英文的 分号 ' ; ' 分隔"
              size="mini"
              style="width: 550%"></el-input>
          </el-form-item>
        </el-row>

      </el-form>

      <hr style="height:1px;border:none;border-top:1px solid rgb(241, 215, 215);"/>

      <!-- 接口内容信息 -->
      <el-form style="margin: 0 20px 0 20px;">
        <el-form-item>

          <!-- 请求方法选择器 -->
          <methodsSelectorView
            ref="methodsSelectorView"
            :method="tempApi.method"
            :busEmitEventName="$busEvents.methodSelectorChoiceMethod"
          ></methodsSelectorView>

          <!-- 接口地址 -->
          <el-input v-model="tempApi.addr" class="input-with-select" placeholder="请输入接口地址"
                    size="mini" style="width: 75%;margin-right: 5px">
          </el-input>

          <!-- 调试按钮 -->
          <el-tooltip class="item" effect="dark" content="会先自动保存，再触发调试" placement="right-end">
            <el-button type="primary" size="mini" :loading="isShowDebugLoading" @click.native="debugApi()">调试
            </el-button>
          </el-tooltip>

        </el-form-item>
      </el-form>

      <!-- 参数信息 -->
      <el-tabs style="margin: 0 20px 0 20px;" v-model="bodyShow">

        <!-- 头部信息 -->
        <el-tab-pane label="头部信息" name="headers">
          <headersView
            ref="headersView"
            :currentData="tempApi.headers"
            :placeholder-key="'key'"
            :placeholder-value="'value'"
            :placeholder-desc="'备注'"
          ></headersView>
        </el-tab-pane>

        <!-- 接口查询字符串信息 -->
        <el-tab-pane label="url参数" name="params">
          <queryStringView
            ref="queryStringView"
            :currentData="tempApi.params"
            :placeholder-key="'key'"
            :placeholder-value="'value'"
            :placeholder-desc="'备注'"
          ></queryStringView>
        </el-tab-pane>

        <!-- 请求体 -->
        <el-tab-pane label="请求体" name="body" :disabled="methodSelectorChoiceMethod === 'GET'">
          <bodyView
            ref="bodyView"
            :data-type="tempApi.data_type"
            :data-json="tempApi.data_json"
            :data-form="tempApi.data_form"
            :data-xml="tempApi.data_xml"
          ></bodyView>
        </el-tab-pane>

        <!-- 数据提取信息 -->
        <el-tab-pane label="数据提取" name="extracts">
          <extractsView
            ref="extractsView"
            :currentData="tempApi.extracts"
            :placeholder-key="'key'"
            :placeholder-value="'value'"
            :placeholder-desc="'备注'"
          ></extractsView>
        </el-tab-pane>

        <!-- 断言信息 -->
        <el-tab-pane label="断言" name="validates">
          <validatesView
            ref="validatesView"
            :validates="tempApi.validates"
          ></validatesView>
        </el-tab-pane>

      </el-tabs>

      <div class="demo-drawer__footer">
        <el-button size="mini" @click=" drawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="isShowSubmitLoading"
          @click=" drawerType === 'update' ? changApi() : addApi() ">
          {{ '确定' }}
        </el-button>
      </div>
    </el-drawer>

  </div>

</template>

<script>
import projectSelectorView from "@/components/Selector/project";
import moduleSelectorView from "@/components/Selector/module";
import environmentSelectorView from "@/components/Selector/environment";
import methodsSelectorView from "@/components/Selector/methods";
import headersView from '@/components/Inputs/changeRow'
import queryStringView from '@/components/Inputs/changeRow'
import bodyView from '@/components/apiBody'
import extractsView from '@/components/Inputs/changeRow'
import validatesView from '@/components/Inputs/validates'

import {postApi, putApi, runApi} from '@/apis/api'
import {reportIsDone} from "@/apis/report";


export default {
  name: 'drawer',
  props: [
    'currentProjectId',
    'currentModuleId',
  ],
  components: {
    projectSelectorView,
    moduleSelectorView,
    environmentSelectorView,
    methodsSelectorView,
    queryStringView,
    headersView,
    bodyView,
    extractsView,
    validatesView
  },
  data() {
    return {

      drawerIsShow: false, // 抽屉是否打开
      direction: 'rtl',  // 抽屉打开方式
      drawerType: '',  // title展示创建还是编辑

      // 请求方法选择组件选择的请求方法
      methodSelectorChoiceMethod: '',

      // 当前选中的服务的hosts列表
      // currentChoiceProjectHosts: [],

      // 是否展示请求接口时的等待状态
      isShowDebugLoading: false,

      isShowSubmitLoading: false,

      // 默认展示的tab页
      bodyShow: 'headers',

      // 接口新增/编辑临时数据
      tempApi: {
        id: '',
        name: '',
        desc: '',
        up_func: '',
        down_func: '',
        method: '',
        choice_host: 'test',
        addr: '',
        headers: [{key: null, value: null, remark: null}],
        params: [{key: null, value: null}],
        data_type: '',
        data_form: [{key: null, form_data_type: null, remark: null, value: null}],
        data_json: JSON.stringify({}),
        data_xml: '',
        extracts: [{key: null, value: null, remark: null}],
        validates: [{key: null, value: null, validate_type: null, remark: null}],
        module_id: '',
        project_id: ''
      }
    }
  },

  methods: {

    // 打开测试报告
    openReportById(reportId) {
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },

    // 调试api，先保存，走数据校验，再发送请求
    debugApi() {
      this.isShowDebugLoading = true
      if (this.tempApi.id) {
        putApi(this.getTempApi()).then(response => {
          this.isShowDebugLoading = false
          if (this.showMessage(this, response)) {
            this.$bus.$emit(this.$busEvents.apiDialogCommitSuccess, 'success')
            this.runApis()
          }
        })
      } else {
        postApi(this.getTempApi()).then(response => {
          this.isShowDebugLoading = false
          if (this.showMessage(this, response)) {
            this.tempApi = response.data
            this.$bus.$emit(this.$busEvents.apiDialogCommitSuccess, 'success')
            this.runApis()
          }
        })
      }
      this.drawerType = 'update'
    },

    runApis() {
      this.isShowDebugLoading = true
      runApi({
        'projectId': this.tempApi.project_id,
        'apis': [this.tempApi.id]
      }).then(runResponse => {
        if (this.showMessage(this, runResponse)) {

          // 触发运行成功，每三秒查询一次，
          // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
          // 已出结果，则停止查询，展示测试报告
          var that = this
          var queryCount = 0
          var timer = setInterval(function () {
            if (queryCount <= 10) {
              reportIsDone({'id': runResponse.data.report_id}).then(queryResponse => {
                if (queryResponse.data === 1) {
                  that.isShowDebugLoading = false
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.isShowDebugLoading = false
              that.$notify({
                title: '测试长时间未运行结束',
                message: '测试长时间未运行结束，不再等待，请到测试报告页查看测试报告',
                type: 'warning',
                duration: 0
              });
              clearInterval(timer)  // 关闭定时器
            }
          }, 3000)
        }
      })
    },

    // 提交添加接口
    addApi() {
      this.isShowSubmitLoading = true
      postApi(this.getTempApi()).then(response => {
        this.isShowSubmitLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.$bus.$emit(this.$busEvents.apiDialogCommitSuccess, 'success')
        }
      })
    },

    // 提交修改接口
    changApi() {
      this.isShowSubmitLoading = true
      putApi(this.getTempApi()).then(response => {
        this.isShowSubmitLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.$bus.$emit(this.$busEvents.apiDialogCommitSuccess, 'success')
        }
      })
    },

    // 点击新增接口时，初始化 dialog 数据
    initNewTempApi() {
      this.tempApi.id = ''
      this.tempApi.name = ''
      this.tempApi.desc = ''
      this.tempApi.up_func = ''
      this.tempApi.down_func = ''
      this.tempApi.method = ''
      this.tempApi.choice_host = 'test'
      this.tempApi.addr = ''
      this.tempApi.headers = [{key: null, value: null, remark: null}]
      this.tempApi.params = [{key: null, value: null}]
      this.tempApi.data_type = ''
      this.tempApi.data_form = [{key: null, data_type: null, remark: null, value: null}]
      this.tempApi.data_json = {}
      this.tempApi.data_xml = ''
      this.tempApi.extracts = [{key: null, value: null, remark: null}]
      this.tempApi.validates = [{key: null, value: null, validate_type: null, remark: null}]
      this.tempApi.module_id = this.currentModuleId ? this.currentModuleId : ''
      this.tempApi.project_id = this.currentProjectId || ''
      this.drawerType = 'create'
      this.drawerIsShow = true
    },

    // 点击修改接口时，初始化 dialog 数据
    initUpdateTempApi(api) {
      this.tempApi = api
      this.drawerIsShow = true
    },

    // 获取 tempApi 用于提交数据
    getTempApi() {
      return {
        id: this.tempApi.id,
        name: this.tempApi.name,
        desc: this.tempApi.desc,
        up_func: this.tempApi.up_func,
        down_func: this.tempApi.down_func,
        addr: this.tempApi.addr,
        method: this.$refs.methodsSelectorView.tempMethod,
        choice_host: this.$refs.environmentSelectorView.current_environment,
        headers: this.$refs.headersView.tempData,
        params: this.$refs.queryStringView.tempData,
        extracts: this.$refs.extractsView.tempData,
        validates: this.$refs.validatesView.tempValidates,
        data_type: this.$refs.bodyView.activeName,
        data_form: this.$refs.bodyView.$refs.dataFormView.tempDataForm,
        data_json: this.$refs.bodyView.$refs.dataJsonView.tempDataJson ? JSON.parse(this.$refs.bodyView.$refs.dataJsonView.tempDataJson) : {},
        data_xml: this.$refs.bodyView.tempDataXml,
        module_id: this.$refs.moduleSelector.tempModuleId,
        project_id: this.tempApi.project_id
      }
    }

  },

  mounted() {

    // 监听请求方法选择器的选中事件
    this.$bus.$on(this.$busEvents.methodSelectorChoiceMethod, (method) => {
      this.methodSelectorChoiceMethod = method
    })

    // 监听 接口编辑框命令事件
    this.$bus.$on(this.$busEvents.apiDialogStatus, (command, api) => {
      if (command === 'add') {
        this.initNewTempApi()  // 新增
      } else if (command === 'edit') {
        this.initUpdateTempApi(api)  // 修改
        this.drawerType = 'update'
      } else if (command === 'copy') {
        this.initUpdateTempApi(api)  // 复制
        this.drawerType = 'add'
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.apiDialogStatus)
    this.$bus.$off(this.$busEvents.methodSelectorChoiceMethod)
  },

  watch: {

    // 监控父组件选中的服务, 实时获取对应的模块列表
    'currentProjectId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.tempApi.project_id = newVal
      }
    },

    // 监控父组件选中的模块
    'currentModuleId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.tempApi.module_id = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
