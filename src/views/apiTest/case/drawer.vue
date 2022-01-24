<template>
  <el-drawer
    :title=" drawerType === 'update' ? '修改用例' : '新增用例'"
    size="80%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <el-tabs v-model="activeName" style="margin-left: 20px;margin-right: 20px">

      <!-- 用例信息组件 -->
      <el-tab-pane label="用例信息" name="caseInFo">

        <el-form :inline="true" size="mini" label-width="100px">

          <el-row>

            <!-- 用例名称 -->
            <el-col :span="10">
              <el-form-item label="用例名称" class="is-required">
                <el-input v-model="tempCase.name" style="width: 200%"></el-input>
              </el-form-item>
            </el-col>

            <!-- 用例集选择 -->
            <el-col :span="7">
              <el-form-item label="用例集" class="is-required" style="margin-bottom: 5px">
                <caseSetSelectorView
                  ref="caseSetSelector"
                  :projectId="currentProjectId || ''"
                  :caseSetId="currentSetId || ''"
                  :isWatchStatus="drawerIsShow"
                  :busOnEventName="$busEvents.projectTreeChoiceProject"
                  :busOnModuleDialogCommit="$busEvents.moduleDialogCommit">
                  >
                </caseSetSelectorView>
              </el-form-item>

            </el-col>
            <!-- 选择环境 -->
            <el-col :span="7">
              <el-tooltip class="item" effect="dark" placement="top-end">
                <div slot="content">
                  请确保此用例涉中及到的所有服务都配置了当前选中环境的域名 <br/>
                  如：选测试环境，则需确保此用例涉及到的所有服务都配置了测试环境的域名
                </div>
                <el-form-item label="环境" class="is-required" style="margin-bottom: 5px">
                  <environmentSelectorView
                    :choice_environment="tempCase.choice_host"
                    ref="environmentSelectorView"
                  ></environmentSelectorView>
                </el-form-item>
              </el-tooltip>
            </el-col>

          </el-row>

          <el-row>

            <!-- 函数文件 -->
            <el-col :span="12">
              <el-form-item label="函数文件">
                <funcFilesView :funcFiles="tempCase.func_files" ref="funcFilesView"></funcFilesView>
              </el-form-item>
            </el-col>

            <!-- 执行次数 -->
            <el-col :span="12">
              <el-form-item label="执行次数" class="is-required">
                <el-input-number v-model="tempCase.run_times" :min="1" :max="1000" controls-position="right"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-form :inline="true" class="demo-form-inline" size="mini">

          <el-tabs type="border-card">

            <el-tab-pane label="头部信息">
              <headersView
                ref="headersView"
                :currentData="tempCase.headers"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              ></headersView>
            </el-tab-pane>

            <el-tab-pane label="公用变量">
              <variablesView
                ref="variablesView"
                :currentData="tempCase.variables"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              ></variablesView>
            </el-tab-pane>

          </el-tabs>

        </el-form>
      </el-tab-pane>

      <!-- 步骤管理组件 -->
      <el-tab-pane label="步骤管理" name="stepInFo">
        <stepView
          ref="stepView"
          :projectId="currentProjectId || ''"
          :caseId="tempCase.id"
          :tempCase="tempCase"
          :stepList="tempCase.steps"
        ></stepView>
      </el-tab-pane>

    </el-tabs>

    <div class="demo-drawer__footer">
      <el-button size="mini" @click=" drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        size="mini"
        type="primary"
        :loading="submitLoadingIsShow"
        @click=" drawerType === 'add' ? addCase() : changCase() ">
        {{ '保存用例' }}
      </el-button>
    </div>

  </el-drawer>

</template>

<script>
import moduleSelectorView from "@/components/Selector/module";
import caseSetSelectorView from "@/components/Selector/caseSet";
import environmentSelectorView from "@/components/Selector/environment";
import funcFilesView from '@/components/Selector/funcFile'
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import stepView from '@/views/apiTest/step'

import {postCase, putCase, copyCase} from "@/apis/case";
import {stepList} from "@/apis/step";

export default {
  name: 'drawer',
  props: [
    'currentProjectId',
    'currentSetId'
  ],
  components: {
    moduleSelectorView,
    caseSetSelectorView,
    environmentSelectorView,
    funcFilesView,
    headersView,
    variablesView,
    stepView
  },
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      drawerType: '',
      drawerIsShow: false,
      submitLoadingIsShow: false,
      activeName: 'caseInFo',
      tempCase: {
        id: '',
        name: '',
        desc: '',
        is_run: true,
        run_times: '',
        choice_host: '',
        func_files: [],
        variables: [{key: null, value: null, remark: null}],
        headers: [{key: null, value: null, remark: null}],
        before_case: [],
        after_case: [],
        project_id: '',
        set_id: '',
        steps: []  // 测试步骤
      },

    }
  },

  methods: {

    // 初始化新增用例模板
    initNewTempCase() {
      this.tempCase.id = ''
      this.tempCase.name = ''
      this.tempCase.desc = ''
      this.tempCase.run_times = ''
      this.tempCase.choice_host = ''
      this.tempCase.func_files = []
      this.tempCase.before_case = []
      this.tempCase.after_case = []
      this.tempCase.variables = [{key: null, value: null, remark: null}]
      this.tempCase.headers = [{key: null, value: null, remark: null}]
      this.tempCase.steps = []
      this.tempCase.project_id = this.currentProjectId || ''
      this.tempCase.set_id = this.currentSetId || ''
      this.drawerType = 'add'
      this.drawerIsShow = true
    },

    // 初始化修改用例模板
    initUpdateTempCase(currentCase) {
      this.tempCase = currentCase
      this.getStepList()
      this.drawerType = 'update'
      this.drawerIsShow = true
    },

    // 获取当前的用例数据，用于提交给后端
    getCaseDataToCommit() {
      let caseData = JSON.parse(JSON.stringify(this.tempCase))
      caseData.set_id = this.$refs.caseSetSelector.tempCaseSetId
      caseData.choice_host = this.$refs.environmentSelectorView.current_environment
      caseData.func_files = this.$refs.funcFilesView.tempFuncFiles
      caseData.variables = this.$refs.variablesView.tempData
      caseData.headers = this.$refs.headersView.tempData
      caseData.steps = this.$refs.stepView.$refs.stepListView.stepList
      return caseData
    },

    // 获取步骤列表
    getStepList() {
      stepList({'caseId': this.tempCase.id}).then(response => {
        this.tempCase.steps = response.data
      })
    },

    // 新增用例
    addCase() {
      this.submitLoadingIsShow = true
      postCase(this.getCaseDataToCommit()).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.tempCase.id = response.data.id
          this.$bus.$emit(this.$busEvents.caseDialogCommitSuccess, 'success')
        }
      })
    },

    // 修改用例
    changCase() {
      this.submitLoadingIsShow = true
      putCase(this.getCaseDataToCommit()).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.$bus.$emit(this.$busEvents.caseDialogCommitSuccess, 'success')
        }
      })
    },

  },

  mounted() {

    // 监听 caseDialog 的状态
    this.$bus.$on(this.$busEvents.caseDialogStatus, (command, currentCase) => {
      if (command === 'add') {
        this.initNewTempCase()
      } else if (command === 'edit') {
        this.initUpdateTempCase(currentCase)
      } else if (command === 'copy') {  // 复制用例
        copyCase({id: currentCase.id}).then(response => {
            if (this.showMessage(this, response)) {
              this.tempCase = response.data.case
              this.tempCase.steps = response.data.steps
              this.drawerType = 'copy'
              this.drawerIsShow = true
              this.$bus.$emit(this.$busEvents.caseDialogCommitSuccess, 'success')
            }
          }
        )
      }
      this.activeName = 'caseInFo'
    })

    // 在添加步骤时触发的 保存用例，这个时候保存后不关闭用例的Dialog框，只重新请求用例列表
    this.$bus.$on(this.$busEvents.isAddStepTriggerSaveCase, (status) => {
      postCase(this.getCaseDataToCommit()).then(response => {
        if (this.showMessage(this, response)) {
          // 把接口返回的用例id赋值给this.tempCase.id
          this.tempCase.id = response.data.id
          this.drawerType = 'update'  // 新增完后把状态改为编辑
          this.$bus.$emit(this.$busEvents.caseDialogCommitSuccess, 'success')
        }
      })
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.caseDialogStatus)
    this.$bus.$off(this.$busEvents.isAddStepTriggerSaveCase)
  },

  watch: {

    'currentProjectId': {
      deep: true,
      handler(newVal, oldVal) {
        this.tempCase.project_id = newVal
      }
    },

    'currentSetId': {
      deep: true,
      handler(newVal, oldVal) {
        this.tempCase.set_id = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
