<template>
  <!--  class="minWidth"-->
  <el-select
    v-model="tempCaseSetId"
    placeholder="请选择用例集"
    value-key="id"
    style="min-width: 20%;padding-right:10px"
    filterable
    size="small"
    :multiple="isMultiple"
    @change="choiceCaseSet">
    <el-option v-for="item in caseSetLists" :key="item.id" :label="item.name" :value="item.id">
    </el-option>
  </el-select>
</template>

<script>
import {caseSetList} from "@/apis/caseSet";

export default {
  name: "caseSetSelector",
  props: [
    'projectId',
    'caseSetId',
    'isWatchStatus',
    'isMultiple',
    'busOnEventName',
    'busEmitEventName'
  ],
  data() {
    return {
      tempCaseSetId: '',
      caseSetLists: [],
      projectIdHistory: []
    }
  },

  created() {
    this.tempCaseSetId = this.caseSetId

    // 第一次加载的时候，如果传了项目id，则获取对应的用例集列表
    if (this.projectId) {
      this.getCaseSetListByProjectId(this.projectId)
    }
  },

  mounted() {

    // if (this.isBusOn) {
    //   this.$bus.$on(this.$busEvents.projectSelectorChoiceProject, (projectId) => {
    //     this.getCaseSetListByProjectId(projectId)
    //   })
    // }

    // if (this.busOnEventName) {
    //   this.$bus.$on(this.busOnEventName, (project) => {
    //     console.log('caseSet.mounted.project: ', JSON.stringify(project))
    //     this.getCaseSetListByProjectId(project.id)
    //     this.tempCaseSetId = []
    //     this.choiceCaseSet(this.tempCaseSetId)
    //   })
    // }

    if (this.busOnEventName) {
      this.$bus.$on(this.busOnEventName, (project) => {
        if (this.isWatchStatus) {
          // console.log('caseSet.mounted.project: ', JSON.stringify(project))
          this.getCaseSetListByProjectId(project.id)
          this.tempCaseSetId = []
          this.choiceCaseSet(this.tempCaseSetId)
        } else {
          this.projectIdHistory.push(project.id)
        }
      })
    }
  },

  // 页面销毁前，关闭bus监听项目选中事件
  beforeDestroy() {
    // this.$bus.$off(this.$busEvents.projectSelectorChoiceProject)
    if (this.busOnEventName) {
      this.$bus.$off(this.busOnEventName)
    }
  },

  methods: {

    // 根据项目id获取用例集
    getCaseSetListByProjectId(project_id) {
      caseSetList({'projectId': project_id}).then(response => {
        this.caseSetLists = response.data.data
      })
    },

    // 遍历用例集列表，获取对应id的用例集信息
    getCaseSetFromList(caseSetId) {
      for (let index in this.caseSetLists) {
        if (this.caseSetLists[index]['id'] === caseSetId) {
          return this.caseSetLists[index]
        }
      }
    },

    // 选择用例集过后向bus发送用例集id
    choiceCaseSet(val) {
      if (this.busEmitEventName) {
        if (this.isMultiple) {
          this.$bus.$emit(this.busEmitEventName, this.tempCaseSetId)
        } else {
          this.$bus.$emit(this.busEmitEventName, this.getCaseSetFromList(this.tempCaseSetId))
        }
      }
    }
  },

  watch: {

    // 监控 状态，为true时，判断项目id是否有改变，有改变则重新请求用例集列表，用于监控dialog是否为打开状态
    "isWatchStatus": {
      handler(newVal, oldVal) {
        // console.log('caseSet.watch.isWatchStatus.oldVal: ', JSON.stringify(oldVal))
        // console.log('caseSet.watch.isWatchStatus.newVal: ', JSON.stringify(newVal))
        // console.log('caseSet.watch.projectIdHistory: ', JSON.stringify(this.projectIdHistory))
        if (newVal) {
          if (this.projectIdHistory && this.projectIdHistory[0] !== this.projectIdHistory[1]) {
            this.getCaseSetListByProjectId(this.projectIdHistory[0])
          }
        }
      }
    },

    // 监控项目id，发生变化时存到临时变量 projectIdHistory，待 status 监听到为true时请求用例集列表
    'projectId': {
      handler(newVal, oldVal) {
        this.projectIdHistory = [newVal, oldVal]
      }
    },

    'caseSetId': {
      handler(newVal, oldVal) {
        this.tempCaseSetId = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
