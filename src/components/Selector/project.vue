<template>
  <el-select
    v-model="tempProjectId"
    placeholder="请选择项目"
    size="small"
    filterable
    style="min-width: 20%;padding-right:10px"
    :disabled="isDisabled"
    @change="choiceProject"
  >
    <el-option v-for="(item) in projectLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>

import {projectList} from '@/apis/project'

export default {
  name: "project",
  props: [
    'projectId',
    'isDisabled',
    'busOnEventName',
    'busEmitEventName'
  ],
  data() {
    return {
      tempProjectId: '',
      projectLists: '',
    }
  },
  methods: {

    // 获取项目列表
    getProjectList() {
      projectList().then(response => {
        this.projectLists = response.data.data
      })
    },

    // 遍历项目列表，获取对应id的项目信息
    getProjectFromProjectList(projectId) {
      for (let index in this.projectLists) {
        if (this.projectLists[index]['id'] === projectId) {
          return this.projectLists[index]
        }
      }
    },

    // 通过bus发送选中的项目
    choiceProject(projectId) {
      if (this.busEmitEventName) {
        // console.log('project.method.choiceProject.projectId: ', JSON.stringify(projectId))
        this.$bus.$emit(this.busEmitEventName, this.getProjectFromProjectList(projectId))
      }
      // this.$bus.$emit(this.$busEvents.projectSelectorChoiceProject, projectId)
    }
  },

  created() {
    this.tempProjectId = this.projectId

    // 把初始的父组件传进来的 projectId 传给bus
    // this.$bus.$emit(this.$busEvents.projectSelectorChoiceProject, this.projectId)
    if (this.busEmitEventName) {
      // console.log('project.created.this.projectId: ', JSON.stringify(this.projectId))
      this.$bus.$emit(this.busEmitEventName, this.getProjectFromProjectList(this.projectId))
    }
    this.getProjectList()
  },

  watch: {
    'projectId': {
      handler(newVal, oldVal) {
        this.tempProjectId = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
