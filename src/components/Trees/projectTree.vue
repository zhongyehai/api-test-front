<template>
  <!-- 结构树/项目列表 -->
  <div class="tabs">
    <el-tabs v-model="projectTab" class="table_padding table_project">
      <el-tab-pane label="项目列表" name="project" style="width: 200px">
        <el-row>
          <!-- 第一列，项目管理 -->
          <el-col :span="3" style="border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
            <el-row style="width: 200px">
              <!-- 项目列表和操作 -->
              <el-scrollbar>
                <el-tree
                  ref="projectTree"
                  class="filter-tree"
                  highlight-current
                  default-expand-all
                  node-key="id"
                  :data="projects.project_list"
                  :props="defaultProps"
                  @node-click="projectClick"
                >

                  <!-- 鼠标滑过事件 -->
                  <span class="custom-tree-node"
                        slot-scope="{ node, data }"
                        style="width:100%;"
                        @mouseenter="mouseenter(data)"
                        @mouseleave="mouseleave(data)">
                  <span>{{ node.label }}</span>
                    <!--                  <span v-show="data.isShow" style="margin-left: 15px">添加</span>-->
                  <span v-show="data.isShow" style="margin-left: 5px">添加</span>
                </span>

                </el-tree>
              </el-scrollbar>
              <!-- 项目列表分页 -->
              <el-pagination
                small
                @current-change="getCurrentPageProjectList"
                :current-page="projects.currentPage"
                :page-size="defaultPage.projectPageSize"
                layout="prev, pager, next"
                :total="projects.project_total"
              >
              </el-pagination>
            </el-row>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import {projectList} from '@/apis/project'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'projectTree',
  directives: {waves},
  components: {
    Pagination
  },
  props: [
    'busEventNameOneClick',
    'busEventNameTwoClick',
  ],

  data() {
    return {
      //  tab页的显示
      projectTab: 'project',

      // 树的显示规则详见element-ui
      defaultProps: {children: 'children', label: 'name'},

      // 初始化数据默认的数据
      defaultPage: {
        pageNum: 1,
        projectPageSize: 20,
        modulePageSize: 19,  // 由于模块操作占了一行，所以只取19条
        apiPageSize: 20
      },

      // 项目列表数据
      projects: {
        project_total: 0,
        project_list: [],
        currentPage: null,
        currentProject: null
      },

      //  默认选中的标识，用于判断是否需要默认选中第一个
      defaultSelectedProject: [],

      // 定义点击次数, 默认0次，区分单击和双击
      treeClickCount: 0,

      // 当前选中的项目
      currentProjectId: null

    }
  },

  created() {
    // 初始化项目列表, 取20条数据
    this.getProjectList({'pageNum': this.defaultPage.pageNum, 'pageSize': this.defaultPage.projectPageSize})
  },

  methods: {

    mouseenter(data) {
      // console.log('mouseenter, data.show = true: ', data)
      data.isShow = true
    },

    mouseleave(data) {
      // console.log('mouseleave, data.show = false: ', data)
      data.isShow = false
    },

    /**这里是关键一步，实现hover */
    renderContent(h, {node, data, store}) {
      console.log(data)
      return (
        <span class="custom-tree-node"
              on-mouseover={() => {
                data.is_show = true
              }}
              on-mouseout={() => {
                data.is_show = false
              }}>
            <span>{node.label}</span>
          {data.is_show ? <span><el-button size="mini" type="text">添加</el-button></span> : null}
          </span>);
    },

    append() {
    },

    // 点击项目时，单击则把项目提交到bus，双击则触发对应的新建事件
    projectClick(project) {
      this.treeClickCount++;  // 记录点击次数
      // 计时器,计算300毫秒为单位,可自行修改
      this.timer = window.setTimeout(() => {
        if (this.treeClickCount === 1) {  // 单击，把项目提交到bus
          if (this.busEventNameOneClick){
            this.$bus.$emit(this.busEventNameOneClick, project)
          }
        } else if (this.treeClickCount > 1) {  // 双击，若传了事件名，则触发对应的新建事件
          if (this.busEventNameTwoClick) {
            // 如果当前任务列表的项目id不为当前点击的项目id，则请求当前点击的项目的任务列表
            if (this.busEventNameOneClick && this.currentProjectId !== project.id){
              this.$bus.$emit(this.busEventNameOneClick, project)
            }
            this.$bus.$emit(this.busEventNameTwoClick, 'add', project)
          }
        }
        this.treeClickCount = 0  // 把次数归零
        this.currentProjectId = project.id
      }, 200);
    },

    // 获取该分页的项目列表
    getCurrentPageProjectList(pageNum) {
      this.projects.currentPage = pageNum
      this.getProjectList({
        'pageNum': pageNum,
        'pageSize': this.defaultPage.projectPageSize
      })
    },

    // 获取项目列表
    getProjectList(params = null) {
      projectList(params).then(response => {
        this.projects.project_list = response.data.data
        this.projects.project_total = response.data.total

        // 把返回列表的第一条数据赋给默认选中的数据，做一个标识，看是否需要重新触发默认点击事件
        if (response.data.total > 0) {
          this.defaultSelectedProject.push(response.data.data[0].id)
        }
      })
    }
  },

  // 当请求项目列表，返回的数据变了之后，默认点击第一条数据
  watch: {
    'defaultSelectedProject': function (newVal, oldVal) {
      if (newVal) {
        this.$nextTick(() => {
          document.querySelector('.el-tree-node__content').click()
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
