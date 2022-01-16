<template>
  <div class="app-container">

    <!-- 步骤列表 -->
    <el-table
      ref="stepListTable"
      v-loading="tableLoadingIsShow"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="stepList"
      fit
      row-key="id"
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column prop="num" label="序号" min-width="8%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

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

      <el-table-column align="center" label="操作" min-width="15%">
        <template slot-scope="scope">

          <el-tooltip class="item" effect="dark" content="复制步骤" placement="top-start">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-document-copy"
              @click.native="copy(scope.row)"></el-button>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" content="编辑步骤" placement="top-start">
            <el-button
              v-if="!scope.row.quote_case"
              type="text"
              size="mini"
              icon="el-icon-edit"
              @click.native="editStep(scope.row, scope.$index)"></el-button>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" content="删除步骤" placement="top-start">
            <el-button
              v-if="!scope.row.quote_case"
              type="text"
              size="mini"
              style="color: red"
              icon="el-icon-delete"
              @click.native="confirmBox(deleteStepOnList, {id: scope.row.id, index: scope.$index}, scope.row.name)">
            </el-button>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" content="解除引用" placement="top-start">
            <el-button
              v-if="scope.row.quote_case"
              type="text"
              style="color: red"
              icon="el-icon-delete"
              @click.native="confirmBox(deleteStepOnList, {id: scope.row.id, index: scope.$index}, scope.row.name)">
            </el-button>
          </el-tooltip>

        </template>
      </el-table-column>

    </el-table>


  </div>
</template>

<script>
import Sortable from 'sortablejs'

import {deleteStep, putStepIsRun, stepSort, stepCopy} from "@/apis/step"

export default {
  name: 'stepList',
  components: {},
  props: ['caseId', 'caseStepList'],
  data() {
    return {

      // 加载状态
      tableLoadingIsShow: false,

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

  mounted() {

    // 新增步骤提交事件，把此步骤添加到步骤列表
    this.$bus.$on(this.$busEvents.addStepIsCommit, (step) => {
      this.stepList.push(step)

      this.oldList = this.stepList.map(v => v.id)
      this.newList = this.oldList.slice()
    })

    // 修改步骤提交事件，更改对应的步骤数据
    this.$bus.$on(this.$busEvents.editStepIsCommit, (step) => {
      for (let index in this.stepList) {
        if (this.stepList[index].id === step.id) {
          this.stepList[index] = step
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
    this.stepList = this.caseStepList ? this.caseStepList : []

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
      this.tableLoadingIsShow = true
      deleteStep({"id": stepInfo.id}).then(response => {
        this.tableLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.stepList.splice(stepInfo.index, 1)  // 从步骤列表中删除步骤
        }
      })
    },

    // 点击编辑步骤
    editStep(row, index) {
      this.currentStep = row
      this.$bus.$emit(this.$busEvents.editStep, this.currentStep)
    },

    // 复制步骤
    copy(row){
      stepCopy({'id': row.id}).then(response => {
        if (this.showMessage(this, response)) {
          this.stepList.push(response.data)
        }
      })
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

          this.tableLoadingIsShow = true
          stepSort({
            List: this.newList
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    }
  },
  watch: {
    'caseStepList': {

      handler(newVal, oldVal) {
        if (newVal && newVal.length > 0) {
          this.stepList = newVal
        } else {
          this.stepList = []
        }

        this.oldList = this.stepList.map(v => v.id)
        this.newList = this.oldList.slice()
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
