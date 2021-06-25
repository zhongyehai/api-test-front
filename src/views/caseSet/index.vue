<template>

  <div class="app-container">

    <!-- 搜索、添加栏 -->
    <div class="filter-container">
      <el-input v-model="listQuery.name" :placeholder="'用例名'" style="width: 200px;" class="filter-item" size="mini"
                @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px" icon="el-icon-search" size="mini"
                 @click="handleFilter"
      >
        {{ '搜索' }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" size="mini"
                 @click="clickCreateCase"
      >
        {{ '添加用例' }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" size="mini"
                 @click="handleInitListQuery"
      >
        {{ '重置' }}
      </el-button>
    </div>
    <br>

    <div class="tabs" style="width: 100%">

      <!-- 项目列表树组件 -->
      <projectTreeView
        ref="projectTree"
        class="projectTree"
        :busEventNameOneClick="$busEvents.projectTreeChoiceProject"
      ></projectTreeView>

      <!-- 用例集列表树组件 -->
      <caseSetTree
        ref="caseSetTree"
        :busOnEventName="$busEvents.projectTreeChoiceProject"
        :busEmitEventName="$busEvents.caseSetTreeChoiceCaseSet"
      ></caseSetTree>

      <!-- 新增/修改用例集表单 -->
      <caseSetDialog
        ref="dialog"
        :currentProject="projectTreeSelectedProject"
        :currentCaseSet="caseSetTreeSelectedCaseSet"
      ></caseSetDialog>

      <!-- 用例管理组件 -->
      <caseManage
        :currentProject="projectTreeSelectedProject"
        :currentCaseSet="caseSetTreeSelectedCaseSet"
      ></caseManage>

    </div>

  </div>

</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import projectTreeView from '@/components/Trees/projectTree' // 项目树组件
import caseSetTree from '@/components/Trees/caseSetTree' // 模块树
import caseSetDialog from '@/views/caseSet/caseSetDialog'  // 模块编辑组件
import caseManage from '@/views/case'  // 接口管理组件
import caseDialog from '@/views/case/caseDialog'  // 新增接口组件

import errorView from '@/components/errorView'  // 错误消息组件

export default {
  name: 'index',
  components: {
    Pagination,
    projectTreeView,
    caseSetTree,
    caseSetDialog,
    errorView,
    caseDialog,
    caseManage
  },
  directives: {waves},
  data() {
    return {

      // 项目树选中的项目
      projectTreeSelectedProject: null,

      // 模块树选中的模块
      caseSetTreeSelectedCaseSet: null,

      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        project_id: undefined,  // 项目id
        module_id: undefined,  // 模块id
        api_name: undefined // 接口名
      }
    }
  },

  mounted() {

    // 监听 项目树 选中 项目 事件
    this.$bus.$on(this.$busEvents.projectTreeChoiceProject, (project) => {
      this.projectTreeSelectedProject = project
    })

    // 监听 用例集树 选中 用例集 事件
    this.$bus.$on(this.$busEvents.caseSetTreeChoiceCaseSet, (caseSet) => {
      this.caseSetTreeSelectedCaseSet = caseSet
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
    this.$bus.$off(this.$busEvents.caseSetTreeChoiceCaseSet)
  },

  methods: {


    // TODO 搜索栏
    handleFilter() {
    },

    // 点击添加接口
    clickCreateCase() {
      this.$bus.$emit(this.$busEvents.caseDialogStatus, 'add')
    },

    handleInitListQuery() {
    }
  },
  computed: {},

  watch: {}
}
</script>

<style scoped>

.projectTree {
  float: left;
  width: 200px;
}

.caseSetTree {
  float: left;
  width: 200px;
  left: 200px;
}

.table_case {
  float: left;
  left: 400px;
}
</style>
