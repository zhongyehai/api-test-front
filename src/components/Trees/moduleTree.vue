<template>
  <!-- 模块树 -->
  <el-tabs v-model="moduleTab" class="table_padding table_module">
    <!-- 模块管理 -->
    <el-tab-pane label="模块列表" name="module">
      <el-row>
        <!-- 第一列 -->
        <el-col :span="3" style="border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">

          <!-- 第一行 -->
          <el-row style="width: 200px">
            <el-col style="border:1px solid;border-color: #ffffff #ffffff rgb(234, 234, 234) #ffffff;padding:2px">
              <el-dropdown @command="moduleCommand" style="float:right;">
                                      <span class="el-dropdown-link" style="color: #4ae2d5">
                                        模块操作{{ projectId ? '' : '（请先选择服务）' }}
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                      </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="add" v-show="projectId">添加</el-dropdown-item>
                  <el-dropdown-item command="edit" v-show="currentModule">编辑</el-dropdown-item>
                  <el-dropdown-item command="stick" v-show="currentModule">置顶</el-dropdown-item>
                  <el-dropdown-item command="del" v-show="currentModule">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>

          <!-- 第二行 -->
          <el-row style="width: 200px">
            <el-scrollbar>
              <el-tree
                ref="moduleTree"
                @node-click="moduleClick"
                class="filter-tree"
                highlight-current
                :default-expanded-keys="[2]"
                :default-checked-keys="[2]"
                node-key="id"
                :data="modules.module_list"
                :props="defaultProps"
              >
              </el-tree>
            </el-scrollbar>
            <el-pagination
              small
              @current-change="getCurrentPageModuleList"
              :current-page="modules.currentPage"
              :page-size="defaultPage.modulePageSize"
              layout="prev, pager, next"
              :total="modules.module_total"
            >
            </el-pagination>
          </el-row>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>

</template>

<script>
import {moduleList, moduleStick, deleteModule} from '@/apis/module'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

// 错误消息组件
import errorView from '@/components/errorView'

export default {
  name: 'moduleTree',
  props: [
    'busOnEventName',
    'busEmitEventName',
  ],
  components: {
    Pagination,
    errorView
  },
  directives: {waves},

  data() {
    return {
      //  tab页的显示
      moduleTab: 'module',

      // 树的显示规则详见element-ui
      defaultProps: {children: 'children', label: 'name'},

      // 当前选中的服务id
      projectId: '',

      // 初始化数据默认的数据
      defaultPage: {
        pageNum: 1,
        modulePageSize: 19  // 由于模块操作占了一行，所以只取19条
      },

      // 模块列表数据
      modules: {
        module_total: 0,
        module_list: [],
        currentPage: undefined,
      },

      // 当前选中的模块
      currentModule: ''
    }
  },

  methods: {

    // 点击模块时，把模块信息提交到接口列表，接口列表根据模块信息做相应的操作
    moduleClick(module) {
      // 把被点击的模块数据先赋值到 currentModule ，判断是否展示置顶、编辑、删除按钮
      this.currentModule = module
      // this.$bus.$emit(this.$busEvents.moduleTreeChoiceModule, module)
      if (this.busEmitEventName){
        this.$bus.$emit(this.busEmitEventName, module)
      }
    },

    // 获取该分页的模块列表
    getCurrentPageModuleList(pageNum) {
      this.getModuleList({
        'pageNum': pageNum,
        'pageSize': this.defaultPage.modulePageSize,
        'projectId': this.projectId
      })
    },

    // 模块操作处理函数，根据命令执行不同操作
    moduleCommand(command) {
      if (command === 'stick') {
        this.stickModule()
      } else if (command === 'del') {
        this.confirmBox(this.delModule, null, this.currentModule.name)
      }
      // 非置顶、非删除，则为添加/修改，发送给bus事件
      this.$bus.$emit(this.$busEvents.moduleTreeCommand, command)
    },

    // 获取模块列表
    getModuleList(params) {
      moduleList(params).then(response => {
        this.modules.module_list = response.data.data
        this.modules.module_total = response.data.total
      })
    },

    // 根据 projectId 获取模块，方便操作后刷新
    getModuleListByProject() {
      this.getModuleList({
        'pageNum': this.defaultPage.pageNum,
        'pageSize': this.defaultPage.modulePageSize,
        'projectId': this.projectId
      })
    },

    // 置顶模块
    stickModule() {
      moduleStick({
        'project_id': this.projectId,
        'id': this.currentModule.id
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.getModuleListByProject()
        }
      })
    },

    // 删除模块
    delModule() {
      deleteModule({
        'id': this.currentModule.id
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.getModuleListByProject()
        }
      })
    }
  },

  computed: {},

  mounted() {

    // 监听选中的服务
    // this.$bus.$on(this.$busEvents.projectTreeChoiceProject, (project) => {
    //   this.projectId = project.id
    //   this.currentModule = ''
    //   this.getModuleListByProject()
    // })
    // 监听服务选择框选中的服务id，获取对应的模块列表
    if (this.busOnEventName){
      this.$bus.$on(this.busOnEventName, (project) => {
        this.projectId = project.id
        this.currentModule = ''
        this.getModuleListByProject()
      })
    }

    // 模块 Dialog 框提交事件，提交成功后重新获取模块列表
    this.$bus.$on(this.$busEvents.moduleDialogCommit, () => {
      this.getModuleListByProject()
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    if (this.busOnEventName){
      this.$bus.$off(this.busOnEventName)
    }
    // this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
    this.$bus.$off(this.$busEvents.moduleDialogCommit)
  },

  watch: {}
}
</script>

<style scoped>

</style>
