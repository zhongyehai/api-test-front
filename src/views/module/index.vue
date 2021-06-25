<template>

  <div class="app-container">

    <!-- 搜索、添加栏 -->
    <div class="filter-container">
      <el-input v-model="listQuery.name" :placeholder="'接口名'" style="width: 200px;" class="filter-item" size="mini"
                @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px" icon="el-icon-search" size="mini"
                 @click="handleFilter"
      >
        {{ '搜索' }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" size="mini"
                 @click="clickCreateApi"
      >
        {{ '添加接口' }}
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

      <!-- 模块列表树组件 -->
      <moduleTreeView
        ref="moduleTree"
        :busOnEventName="$busEvents.projectTreeChoiceProject"
        :busEmitEventName="$busEvents.moduleTreeChoiceModule"
      ></moduleTreeView>

      <!-- 新增/修改 模块 dialog -->
      <moduleDialog
        :currentProject="projectTreeSelectedProject"
        :currentModule="moduleTreeSelectedModule"
      ></moduleDialog>

      <!-- 接口管理组件 -->
      <apiManage
        :currentProject="projectTreeSelectedProject"
        :currentModule="moduleTreeSelectedModule"
      ></apiManage>

    </div>

  </div>

</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import projectTreeView from '@/components/Trees/projectTree' // 项目树组件
import moduleTreeView from '@/components/Trees/moduleTree' // 模块树
import moduleDialog from '@/views/module/moduleDialog'  // 模块编辑组件
import apiManage from '@/views/api'  // 接口管理组件

export default {
  name: 'index',
  components: {
    Pagination,
    projectTreeView,
    moduleTreeView,
    moduleDialog,
    apiManage
  },
  directives: {waves},
  data() {
    return {

      // 项目树选中的项目
      projectTreeSelectedProject: null,

      // 模块树选中的模块
      moduleTreeSelectedModule: null,

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

    // 监听 模块树 选中 模块 事件
    this.$bus.$on(this.$busEvents.moduleTreeChoiceModule, (module) => {
      console.log('module.index.bus.on.moduleTreeChoiceModule.module: ', JSON.stringify(module))
      this.moduleTreeSelectedModule = module
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
    this.$bus.$off(this.$busEvents.moduleTreeChoiceModule)
  },

  methods: {

    // TODO 搜索栏
    handleFilter() {
    },

    // 点击添加接口
    clickCreateApi() {
      // 由于 body 组件监听时会解析请求体，所以这给个默认值
      this.$bus.$emit(this.$busEvents.apiDialogStatus, 'add', {
        data_type: 'json',
        data_json: {},
        data_form: [{key: null, data_type: null, remark: null, value: null}]
      })
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

.table_module {
  float: left;
  width: 200px;
  left: 200px;
}

.table_api {
  float: left;
  left: 400px;
}
</style>
