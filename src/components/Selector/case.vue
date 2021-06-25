<template>
  <el-select
    v-model="tempCase"
    multiple
    placeholder="选择用例"
    value-key="id"
    :disabled="caseSelectorIsDisabled"
    style="min-width: 20%;padding-right:10px"
    size="small"
    @change="choiceCase"
  >
    <el-option v-for="item in tempCaseList" :key="item.id" :label="item.name" :value="item.id">
    </el-option>
  </el-select>
</template>

<script>
import {caseList} from '@/apis/case'

export default {
  name: "caseSelector",
  props: [
    'caseSetId',
    'caseIds',
    'busOnEventName',
    'busEmitEventName'
  ],
  data() {
    return {
      caseSelectorIsDisabled: false,
      tempCaseSetId: '',
      tempCase: '',
      tempCaseList: [],

    }
  },
  methods: {
    getCaseList() {
      caseList({caseSetId: this.tempCaseSetId}).then(response => {
        this.tempCaseList = response.data.data
      })
    },

    choiceCase(caseId) {
      if (this.busEmitEventName) {
        this.$bus.$emit(this.busEmitEventName, caseId)
      }
    }
  },
  mounted() {

    if (this.busOnEventName) {
      this.$bus.$on(this.busOnEventName, (caseSetList) => {
        // 选中了多个用例集，则清空选中的用例，并把用例选择框置为不可编辑
        if (caseSetList && caseSetList.length > 1) {
          this.caseSelectorIsDisabled = true
        } else {
          // 只选中了一个用例集的时候，获取该用例集下的用例渲染到下拉框
          this.caseSelectorIsDisabled = false
          this.tempCaseSetId = caseSetList[0]
          this.getCaseList()
        }
        this.tempCase = []
      })
    }

    // this.$bus.$on(this.$busEvents.caseSetSelectorChoiceCaseSet, (caseSetList) => {
    //   // 选中了多个用例集，则清空选中的用例，并把用例选择框置为不可编辑
    //   if (caseSetList && caseSetList.length > 1) {
    //     this.tempCase = ''
    //     this.caseSelectorIsDisabled = true
    //   } else {
    //     // 只选中了一个用例集的时候，获取该用例集下的用例渲染到下拉框
    //     this.caseSelectorIsDisabled = false
    //     this.tempCaseSetId = caseSetList[0]
    //     this.getCaseList()
    //   }
    // })
  },

  // 页面销毁前，关闭bus监听项目选中事件
  beforeDestroy() {
    // this.$bus.$off(this.$busEvents.caseSetSelectorChoiceCaseSet)
    if (this.busOnEventName) {
      this.$bus.$off(this.busOnEventName)
    }
  },

  created() {
    this.tempCaseSetId = this.caseSetId

    this.tempCase = this.caseIds

    if (this.tempCaseSetId) {
      this.getCaseList()
    }
  },

  watch: {

    'caseIds': {
      handler(newVal, oldVal) {
        this.tempCase = newVal
      }
    },

    'caseSetId': {
      handler(newVal, oldVal) {
        this.tempCaseSetId = newVal
        this.getCaseList()
      }
    }
  }
}
</script>

<style scoped>

</style>
