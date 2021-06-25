<template>
  <el-select
    v-model="tempModuleId"
    placeholder="请选择模块"
    size="small"
    style="min-width: 20%;padding-right:10px"
    @change="clickModule"
    filterable
  >
    <el-option v-for="(item) in tempModuleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>
import {moduleList} from "@/apis/module";

export default {
  name: "module",
  props: [
    "moduleId",
    "projectId",
    "status",
    'busOnEventName',
    'busOnModuleDialogCommit',
    'busEmitEventName',
  ],
  data() {
    return {
      tempProjectId: '',
      tempModuleId: '',
      tempModuleList: [],

      projectIdHistory: [],  // 用于存项目改变的历史
      moduleListHistory: [],  // 用于存模块改变的历史
    }
  },

  mounted() {

    // 监听项目选择框选中的项目id，获取对应的模块列表
    if (this.busOnEventName) {
      this.$bus.$on(this.busOnEventName, (project) => {
        // console.log('module.mounted.busOnEventName.project: ', JSON.stringify(project))
        this.getModulesByProjectId(project.id)
      })
    }
    // this.$bus.$on(this.$busEvents.projectSelectorChoiceProject, (projectId) => {
    //   console.log('module.mounted.projectSelectorChoiceProject.projectId: ', JSON.stringify(projectId))
    //   this.getModulesByProjectId(projectId)
    // })

    // 是否监控模块的改变
    if (this.busOnModuleDialogCommit) {
      this.$bus.$on(this.busOnModuleDialogCommit, (status) => {
        this.moduleListHistory.push(status)
      })
    }
  },

  // 组件销毁前，关闭bus监听项目选中事件
  beforeDestroy() {
    if (this.busOnEventName) {
      this.$bus.$off(this.busOnEventName)
    }
    if (this.busOnModuleDialogCommit) {
      this.$bus.$off(this.busOnModuleDialogCommit)
    }
    // this.$bus.$off(this.$busEvents.projectSelectorChoiceProject)
  },

  methods: {

    // 获取项目id对应的模块列表
    getModulesByProjectId(project_id) {
      moduleList({'projectId': project_id}).then(response => {
        this.tempModuleList = response.data.data
      })
    },

    sendEmit() {
      if (this.busEmitEventName) {
        this.$bus.$emit(this.busEmitEventName, this.tempModuleId)
      }
    },

    // 通过bus发送选中的模块
    clickModule(val) {
      // console.log('module.methods.clickModule: ', JSON.stringify(val))
      this.sendEmit()
      // this.$bus.$emit(this.$busEvents.moduleSelectorChoiceModule, this.tempModuleId)
    }

  },

  created() {
    // console.log('module.created.moduleId: ', JSON.stringify(this.moduleId))
    this.tempModuleId = this.moduleId

    // 第一次加载的时候，获取对应的模块列表
    // console.log('module.created.this.projectId: ', JSON.stringify(this.projectId))
    if (this.projectId) {
      this.getModulesByProjectId(this.projectId)
    }
  },

  watch: {

    // 监控 状态，为true时，判断项目id是否有改变，有改变则重新请求模块列表
    "status": {
      handler(newVal, oldVal) {
        // console.log('module.watch.status.oldVal: ', JSON.stringify(oldVal))
        // console.log('module.watch.status.newVal: ', JSON.stringify(newVal))
        // console.log('module.watch.projectIdHistory: ', JSON.stringify(this.projectIdHistory))
        if (newVal) {
          // 判断项目id是否有改变，有改变则重新请求模块列表
          if (this.projectIdHistory && this.projectIdHistory[0] !== this.projectIdHistory[1]) {
            this.getModulesByProjectId(this.projectIdHistory[0])
          } else {
            // 判断模块列表是否有改变，有则重新请求模块列表
            if (this.moduleListHistory.length > 0) {
              this.getModulesByProjectId(this.projectId)
            }
          }


        }
      }
    },

    // 监控项目id，发生变化时存到临时变量 projectIdHistory，待 status 监听到为true时请求模块列表
    'projectId': {
      handler(newVal, oldVal) {
        // console.log('module.watch.projectId.oldVal: ', JSON.stringify(oldVal))
        // console.log('module.watch.projectId.newVal: ', JSON.stringify(newVal))
        if (this.status) {
          this.getModulesByProjectId(newVal)
        } else {
          this.projectIdHistory = [newVal, oldVal]
        }
      }
    },

    'moduleId': {
      handler(newVal, oldVal) {
        // console.log('module.watch.moduleId.oldVal: ', JSON.stringify(oldVal))
        // console.log('module.watch.moduleId.newVal: ', JSON.stringify(newVal))
        this.tempModuleId = newVal
      }
    },


    'tempModuleList': {
      handler(newVal, oldVal) {
        // console.log('module.watch.tempModuleList.oldVal: ', JSON.stringify(oldVal))
        // console.log('module.watch.tempModuleList.newVal: ', JSON.stringify(newVal))

        // 如果没有选中模块id，则默认选择模块列表中的第一条数据
        if (newVal && !this.tempModuleId) {
          // this.tempModuleId = newVal[0].id
          if (newVal[0]) {
            this.tempModuleId = newVal[0].id
          }

        }
        // else {
        //   this.tempModuleId = ''
        // }
        // this.$bus.$emit(this.$busEvents.moduleSelectorChoiceModule, this.tempModuleId)
        this.sendEmit()
      }
    },

    // 'tempModuleId': {
    //   handler(newVal, oldVal) {
    //     if (newVal){
    //       this.$bus.$emit(this.$busEvents.moduleSelectorChoiceModule, newVal)
    //     }
    //     console.log('module.watch.tempModuleId.oldVal: ', JSON.stringify(oldVal))
    //     console.log('module.watch.tempModuleId.newVal: ', JSON.stringify(newVal))
    //   }
    // },
  }
}
</script>

<style scoped>

</style>
