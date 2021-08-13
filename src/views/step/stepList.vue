<template>
  <div class="app-container">

    <!-- 步骤列表 -->
    <el-table
      ref="stepListTable"
      :data="stepList"
      fit
      row-key="id"
      highlight-current-row
      style="width: 100%"
      :height="tableListHeight"
    >
      <el-table-column align="center" label="执行" min-width="10%">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.is_run" @change="changeStepIsRun(scope.$index)"></el-switch>
        </template>
      </el-table-column>

      <el-table-column align="center" label="步骤名称" min-width="40%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="25%">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click.native="editStep(scope.row, scope.$index)">编辑</el-button>
          <el-button type="danger" size="mini"
                     @click.native="confirmBox(deleteStepOnList, {id: scope.row.id, index: scope.$index}, scope.row.name)">
            删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>


  </div>
</template>

<script>
import Sortable from 'sortablejs'

import {deleteStep, putStepIsRun} from "@/apis/step"

export default {
  name: 'stepList',
  components: {},
  props: ['caseId', 'caseStepList'],
  data() {
    return {

      // 步骤列表
      stepList: [],

      // 当前步骤
      currentStep: {},

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
    }
  },

  computed: {
    // 当前屏幕的高度，用于控制表格，超过指定的高度时，用下拉处理
    tableListHeight() {
      return `${window.innerHeight * 0.8}px`
    }
  },

  mounted() {

    // 新增步骤提交事件，把此步骤添加到步骤列表
    this.$bus.$on(this.$busEvents.addStepIsCommit, (step) => {
      // console.log('stepList.mounted.this.$bus.$on.addStepIsCommit: ', JSON.stringify(step))
      // this.stepList = this.stepList.push(step)
      this.stepList.push(step)
    })

    // 修改步骤提交事件，更改对应的步骤数据
    this.$bus.$on(this.$busEvents.editStepIsCommit, (step) => {
      // console.log('stepList.mounted.this.$bus.$on.stepTabIsCommit.step: ', JSON.stringify(step))
      // console.log('stepList.mounted.this.$bus.$on.stepTabIsCommit.step : ', JSON.stringify(step))
      for (let index in this.stepList) {
        if (this.stepList[index].id === step.id) {
          this.stepList[index] = step
          // console.log('stepList.mounted.this.$bus.$on.stepTabIsCommit.this.stepList.new: ', JSON.stringify(this.stepList))
          return
        }
      }
    })
  },

  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听选中事件
    this.$bus.$off(this.$busEvents.addStepIsCommit)
    this.$bus.$off(this.$busEvents.editStepIsCommit)
  },

  created() {

    // 初始化父组件传过来的步骤列表
    // console.log('step.stepList.created.this.caseStepList: ', JSON.stringify(this.caseStepList))
    this.stepList = this.caseStepList ? this.caseStepList : []
    // console.log('step.stepList.created.this.stepList: ', JSON.stringify(this.stepList))

    this.oldList = this.stepList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },
  methods: {

    // 修改步骤的执行状态
    changeStepIsRun(index) {
      let step = this.stepList[index]
      putStepIsRun({'id': step.id, 'is_run': step.is_run}).then(response => {
        this.showMessage(this, response)
      })
    },

    // 删除步骤
    deleteStepOnList(stepInfo) {
      // console.log('stepInfo: ', JSON.stringify(stepInfo))
      deleteStep({"id": stepInfo.id}).then(response => {
        if (this.showMessage(this, response)) {
          this.stepList.splice(stepInfo.index, 1)  // 从步骤列表中删除步骤
        }
      })
    },

    // 点击编辑步骤
    editStep(row, index) {
      this.currentStep = row
      // this.currentStep.num = index
      this.$bus.$emit(this.$busEvents.editStep, this.currentStep)
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.stepListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.stepList.splice(evt.oldIndex, 1)[0]
          this.stepList.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)
        }
      })
    }
  },
  watch: {
    'caseStepList': {

      handler(newVal, oldVal) {
        // console.log('step.stepList.watch.caseStepList.oldVal: ', JSON.stringify(oldVal))
        // console.log('step.stepList.watch.caseStepList.newVal: ', JSON.stringify(newVal))
        if (newVal && newVal.length > 0) {
          this.stepList = newVal
        } else {
          this.stepList = []
        }
      }
    }
  }
}
</script>

<style>
.sortable-ghost {
  opacity: .8;
  color: #fff !important;
  background: #42b983 !important;
}
</style>

<style scoped>
.icon-star {
  margin-right: 2px;
}

.drag-handler {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.show-d {
  margin-top: 15px;
}
</style>
