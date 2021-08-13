<template>

  <!-- 步骤管理组件 -->
  <el-row>

    <!-- 步骤列表 -->
    <el-col :span="10">
      <stepListView ref="stepListView" :caseStepList="stepList" :caseId="caseId"></stepListView>
    </el-col>

    <!-- 步骤操作 -->
    <el-col :span="14">

      <el-tabs v-model="activeName">

        <!-- 接口列表 -->
        <el-tab-pane label="接口列表" name="apiList">
          <apiListView ref="apiListView" :projectId="this.projectId" :dialogIsShow="dialogIsShow"
                       :currentCaseId="caseId"
          ></apiListView>
        </el-tab-pane>

        <!-- 步骤编辑 -->
        <el-tab-pane label="步骤信息" name="editStepInfo">
          <editStepView ref="editStepView" :caseId="caseId"></editStepView>
        </el-tab-pane>

      </el-tabs>

    </el-col>

  </el-row>


</template>

<script>


import stepListView from '@/views/step/stepList'
import apiListView from '@/views/step/apiList'
import editStepView from "@/views/step/editStep";

import {stepList} from "@/apis/step";

export default {
  name: 'index',
  props: [
    'projectId',
    'caseId',
    'stepList'
  ],
  components: {
    stepListView,
    apiListView,
    editStepView
  },
  data() {
    return {
      dialogStatus: '',
      dialogIsShow: false,
      activeName: 'apiList',

    }
  },

  methods: {},

  mounted() {

    // 新增步骤
    this.$bus.$on(this.$busEvents.addApiToStep, (api) => {
      this.activeName = 'editStepInfo'
    })

    // 编辑步骤
    this.$bus.$on(this.$busEvents.editStep, (api) => {
      this.activeName = 'editStepInfo'
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.addApiToStep)
    this.$bus.$off(this.$busEvents.editStep)
  },

  created() {
    // console.log('step.index.created.this.stepList: ', JSON.stringify(this.stepList))
  },


  watch: {

    // 'projectId': {
    //   deep: true,
    //   handler(newVal, oldVal) {
    //     this.tempCase.project_id = newVal
    //   }
    // },

  }
}
</script>

<style scoped>

</style>
