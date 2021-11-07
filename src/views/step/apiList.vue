<template>
  <div>

    <!-- 项目选择框 -->
    <projectSelectorView
      :projectId="projectId"
      :busEmitEventName="$busEvents.projectSelectorChoiceProject"
    ></projectSelectorView>

    <!-- 模块选择框 -->
    <moduleSelectorView
      :moduleId="''"
      :projectId="projectId"
      :status="dialogIsShow"
      :busOnEventName="$busEvents.projectSelectorChoiceProject"
      :busEmitEventName="$busEvents.moduleSelectorChoiceModule"
    ></moduleSelectorView>

    <!-- 接口列表 -->
    <div>

      <el-table
        ref="apiTable"
        :data="apiList.data"
        stripe
      >
        <el-table-column prop="num" label="序号" min-width="10%">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip=true prop="name" label="接口名称" min-width="30%"></el-table-column>
        <el-table-column :show-overflow-tooltip=true prop="addr" label="接口地址" min-width="40%"></el-table-column>
        <el-table-column align="center" label="操作" min-width="20%">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click.native="addApiToStep(scope.row)">添加到步骤</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="apiList.total>0"
        :total="apiList.total"
        :page.sync="defaultPage.pageNum"
        :limit.sync="defaultPage.PageSize"
        @pagination="getApiList"/>

    </div>

  </div>

</template>

<script>
import projectSelectorView from "@/components/Selector/project";
import moduleSelectorView from "@/components/Selector/module";
import editStepView from "@/views/step/editStep";
import Pagination from '@/components/Pagination'

import {apiList} from "@/apis/api";

export default {
  name: 'apiList',
  props: [
    'projectId',
    'dialogIsShow',
    'currentCaseId'
  ],
  components: {
    Pagination,
    projectSelectorView,
    moduleSelectorView,
    editStepView,
  },
  data() {
    return {
      activeName: "stepList",

      tempProjectId: '',
      moduleId: '',
      caseId: '',

      apiList: {
        total: 0,
        data: []
      },
      defaultPage: {
        pageNum: 0,
        PageSize: 10
      },

    }
  },

  mounted() {

    // 获取模块对应的接口列表
    this.$bus.$on(this.$busEvents.moduleSelectorChoiceModule, (moduleId) => {
      this.moduleId = moduleId
      this.getApiListByModuleId()
    })
  },

  created() {
    this.caseId = this.currentCaseId
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.moduleSelectorChoiceModule)
  },

  methods: {

    // 根据模块id内容获取接口列表
    getApiListByModuleId() {
      apiList({
        'moduleId': this.moduleId,
        'pageNum': this.defaultPage.pageNum,
        'pageSize': this.defaultPage.PageSize
      }).then(response => {
        this.apiList.data = response.data.data ? response.data.data : []
        this.apiList.total = response.data.total ? response.data.total : 0
      })
    },

    // 切换页数
    getApiList(value) {
      this.getApiListByModuleId()
    },

    // 深拷贝接口，添加到步骤列表
    addApiToStep(api) {

      // 如果没有用例id，则先保存用例
      // console.log('apiList.methods.addApiToStep.this.caseId: ', this.caseId)
      if (!this.caseId) {
        this.$bus.$emit(this.$busEvents.isAddStepTriggerSaveCase, 'true')
      }

      // 如果用例已存在，则添加步骤
      if (this.caseId){
        this.activeName = 'editStepInfo'

        // 把当前选中的接口，传给步骤编辑tab
        // 初始化步骤的默认值
        var new_api = JSON.parse(JSON.stringify(api))
        new_api['api_id'] = new_api['id']
        new_api['id'] = ''
        new_api['is_run'] = true
        new_api['run_times'] = 1
        this.$bus.$emit(this.$busEvents.addApiToStep, new_api)
      }
    }
  },
  watch: {

    'currentCaseId': {
      handler(newVal, oldVal) {
        this.caseId = newVal
      }
    }

  }
}
</script>

<style scoped>

</style>
