<template>


  <el-tabs v-model="activeName" v-show="currentStep.api_id">
    <!-- 步骤信息 -->
    <el-tab-pane label="步骤信息" name="editStepInfo">
      <el-form label-width="120px">

        <el-form-item label="步骤名称" prop="name" size="small" class="is-required">
          <el-input v-model="currentStep.name" placeholder="步骤名称"></el-input>
        </el-form-item>

        <el-form-item label="请求方法" prop="name" size="small">
          <el-input disabled v-model="currentStep.method"></el-input>
        </el-form-item>

        <el-form-item label="接口地址" prop="name" size="small">
          <el-input disabled v-model="currentStep.addr"></el-input>
        </el-form-item>

        <el-form-item label="前置处理" size="small">
          <el-input
            type="textarea"
            autosize
            v-model="currentStep.up_func"
            placeholder="前置处理函数，多个时用英文的 分号 ' ; ' 分隔"></el-input>
        </el-form-item>

        <el-form-item label="后置处理" size="small">
          <el-input
            type="textarea"
            autosize
            v-model="currentStep.down_func"
            placeholder="后置处理函数，多个时用英文的 分号 ' ; ' 分隔"></el-input>
        </el-form-item>

        <el-form-item label="执行次数" class="is-required">
          <el-input-number
            v-model="currentStep.run_times"
            size="mini"
            :precision="0"
            :min="1"
            :max="1000"
          ></el-input-number>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <!-- 头部信息 -->
    <el-tab-pane label="头部信息" name="editHeaders">
      <headersView
        ref="headersView"
        :currentData="currentStep.headers"
        :placeholderKey="'字段名'"
        :placeholderValue="'字段值'"
        :placeholderDesc="'备注'"
      ></headersView>
    </el-tab-pane>

    <!-- url参数 -->
    <el-tab-pane label="url参数" name="editParams">
      <paramsView
        ref="paramsView"
        :currentData="currentStep.params"
        :placeholderKey="'字段名'"
        :placeholderValue="'字段值'"
        :placeholderDesc="'备注'"
      ></paramsView>
    </el-tab-pane>

    <!-- 请求体 -->
    <el-tab-pane label="请求体" name="editBody">
      <bodyView
        ref="bodyView"
        :data-type="currentStep.data_type"
        :data-json="currentStep.data_json"
        :data-form="currentStep.data_form"
        :data-xml="currentStep.data_xml"
      ></bodyView>
    </el-tab-pane>

    <!-- 数据提取 -->
    <el-tab-pane label="数据提取" name="editExtracts">
      <extractsView
        ref="extractsView"
        :currentData="currentStep.extracts"
        :placeholderKey="'起个变量名'"
        :placeholderValue="'提取数据的表达式'"
        :placeholderDesc="'备注'"
      ></extractsView>
    </el-tab-pane>

    <!-- 断言信息 -->
    <el-tab-pane label="断言" name="editAssert">
      <validatesView
        ref="validatesView"
        :validates="currentStep.validates"
      ></validatesView>
    </el-tab-pane>

    <!-- 数据驱动 -->
    <el-tab-pane label="数据驱动" name="editDataDriver">
      <bodyView
        ref="dataDriverView"
        :data-type="'json'"
        :data-json="currentStep.data_driver"
        :data-form="''"
      ></bodyView>
    </el-tab-pane>

    <hr>

    <el-button size="mini" @click="rowBackStep()"> {{ '还原' }}</el-button>
    <el-button
      size="mini"
      type="primary"
      :loading="submitButtonIsLoading"
      @click="currentStep.id ? editStep() : addStep()">{{ '保存步骤' }}
    </el-button>
  </el-tabs>
</template>

<script>

import headersView from "@/components/Inputs/changeRow"
import paramsView from "@/components/Inputs/changeRow"
import bodyView from '@/components/apiBody'
import extractsView from "@/components/Inputs/changeRow"
import validatesView from "@/components/Inputs/validates";

import {postStep, putStep} from "@/apis/step"
import {getApi} from "@/apis/api";

export default {
  name: "editStep",
  props: [
    'caseId'
  ],
  components: {
    headersView,
    paramsView,
    bodyView,
    extractsView,
    validatesView
  },
  data() {
    return {
      submitButtonIsLoading: false,
      activeName: 'editStepInfo',
      currentStepCopy: '',
      currentStep: {
        'id': '',
        "is_run": '',
        "name": '',
        "up_func": '',
        "down_func": '',
        "run_times": 0,
        "headers": [],
        "params": [],
        "extracts": [],
        "validates": [],
        "data_form": [],
        "data_json": '',
        "data_xml": '',
        "data_driver": '',
        "case_id": this.caseId,
        "api_id": '',
        "project_id": ''
      },
      // stepId: ''  // 避免重复请求步骤列表，新建完步骤过后，把步骤id更新给步骤列表
    }
  },
  methods: {

    initStep() {
      return {
        'id': '',
        "is_run": '',
        "name": '',
        "up_func": '',
        "down_func": '',
        "run_times": 0,
        "headers": [],
        "params": [],
        "extracts": [],
        "validates": [],
        "data_form": [],
        "data_json": '',
        "data_xml": '',
        "data_driver": '',
        "case_id": this.caseId,
        "api_id": '',
        "project_id": ''
      }
    },

    getStepForCommit() {
      return {
        'id': this.currentStep.id,
        "is_run": this.currentStep.is_run,
        "name": this.currentStep.name,
        "up_func": this.currentStep.up_func,
        "down_func": this.currentStep.down_func,
        "run_times": this.currentStep.run_times,
        "headers": this.$refs.headersView.tempData,
        "params": this.$refs.paramsView.tempData,
        "extracts": this.$refs.extractsView.tempData,
        "validates": this.$refs.validatesView.tempValidates,
        "data_form": this.$refs.bodyView.$refs.dataFormView.tempDataForm,
        "data_json": this.$refs.bodyView.$refs.dataJsonView.tempDataJson ? JSON.parse(this.$refs.bodyView.$refs.dataJsonView.tempDataJson) : {},
        "data_xml": this.$refs.bodyView.tempDataXml,
        "data_driver": this.$refs.dataDriverView.$refs.dataJsonView.tempDataJson ? JSON.parse(this.$refs.dataDriverView.$refs.dataJsonView.tempDataJson) : {},
        "quote_case": null,
        "case_id": this.caseId,
        "api_id": this.currentStep.api_id,
        "project_id": this.currentStep.project_id
      }
    },

    // 新增步骤信息
    addStep() {
      this.submitButtonIsLoading = true
      postStep(this.getStepForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          // 避免重复请求步骤列表，新建完步骤过后，把新增的步骤给步骤列表更新
          this.$bus.$emit(this.$busEvents.addStepIsCommit, response.data)
        }
      })
    },

    // 修改步骤信息
    editStep() {
      this.submitButtonIsLoading = true
      putStep(this.getStepForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          // 避免重复请求步骤列表，新建完步骤过后，把新增的步骤给步骤列表更新
          this.$bus.$emit(this.$busEvents.editStepIsCommit, response.data)
        }

      })
    },

    // 取消保存
    rowBackStep() {
      this.currentStep = this.currentStepCopy
    }
  },

  mounted() {

    // 新增步骤
    this.$bus.$on(this.$busEvents.addApiToStep, (step, type) => {
      if (type !== 'quote') {
        this.currentStep = JSON.parse(JSON.stringify(step))  // 深拷贝
        this.currentStepCopy = JSON.parse(JSON.stringify(step))  // 深拷贝
      }
    })

    // 编辑步骤
    this.$bus.$on(this.$busEvents.editStep, (step) => {

      // 获取接口的地址和请求方法
      getApi({id: step.api_id}).then(response => {
        this.$set(this.currentStep, 'addr', response.data.addr)
        this.$set(this.currentStep, 'method', response.data.method)
      })

      this.currentStep = JSON.parse(JSON.stringify(step))  // 深拷贝
      this.currentStepCopy = JSON.parse(JSON.stringify(step))  // 深拷贝
    })

    // 打开用例caseDialog的时候，初始化步骤编辑栏，定位到步骤信息栏
    this.$bus.$on(this.$busEvents.caseDialogStatus, (command, currentCase) => {
      this.activeName = 'editStepInfo'
      this.currentStep = this.initStep()
    })

  },

  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听选中事件
    this.$bus.$off(this.$busEvents.addApiToStep)
    this.$bus.$off(this.$busEvents.editStep)
    this.$bus.$off(this.$busEvents.caseDialogStatus)
  },

  created() {
    // this.currentStep = this.step
    // this.currentStepCopy = JSON.parse(JSON.stringify(this.step))  // 深拷贝，用于还原
  },

  watch: {

    // 'parentActiveName': {
    //   handler(newVal, oldVal) {
    //     console.log('parentActiveName.newVal: \n', JSON.stringify(newVal))
    //     console.log('parentActiveName.oldVal: \n', JSON.stringify(oldVal))
    //     if (newVal === 'editStepInfo'){
    //
    //     }
    //     this.currentStep = newVal
    //     this.currentStepCopy = JSON.parse(JSON.stringify(newVal))  // 深拷贝，用于还原
    //   }
    // }

    // 'step': {
    //   handler(newVal, oldVal) {
    //     console.log('stepDialog.watch.step.newVal: \n', JSON.stringify(newVal))
    //     console.log('stepDialog.watch.step.oldVal: \n', JSON.stringify(oldVal))
    //     this.currentStep = newVal
    //     this.currentStepCopy = JSON.parse(JSON.stringify(newVal))  // 深拷贝，用于还原
    //   }
    // }

  }
}
</script>

<style scoped>

</style>
