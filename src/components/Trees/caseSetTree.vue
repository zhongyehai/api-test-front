<template>
  <!-- 模块树 -->
  <el-tabs v-model="caseSetTab" class="table_padding caseSetTree">
    <!-- 模块管理 -->
    <el-tab-pane label="用例集列表" name="caseSet">
      <el-row>
        <!-- 第一列 -->
        <el-col :span="3" style="border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">

          <!-- 第一行 -->
          <el-row style="width: 200px">
            <el-col style="border:1px solid;border-color: #ffffff #ffffff rgb(234, 234, 234) #ffffff;padding:2px">
              <el-dropdown @command="caseSetCommand" style="float:right;">
                                      <span class="el-dropdown-link" style="color: #4ae2d5">
                                        用例集操作{{ projectId ? '' : '（请先选择服务）' }}
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                      </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="add" v-show="projectId">添加</el-dropdown-item>
                  <el-dropdown-item command="edit" v-show="currentCaseSet">编辑</el-dropdown-item>
                  <el-dropdown-item command="stick" v-show="currentCaseSet">置顶</el-dropdown-item>
                  <el-dropdown-item command="del" v-show="currentCaseSet">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>

          <!-- 第二行 -->
          <el-row style="width: 200px">
            <el-scrollbar>
              <el-tree
                ref="caseSetTree"
                @node-click="caseSetClick"
                class="filter-tree"
                highlight-current
                :default-expanded-keys="[2]"
                :default-checked-keys="[2]"
                node-key="id"
                :data="caseSets.caseSet_list"
                :props="defaultProps"
              >
              </el-tree>
            </el-scrollbar>
            <el-pagination
              small
              @current-change="getCurrentPageCaseSetList"
              :current-page="caseSets.currentPage"
              :page-size="defaultPage.modulePageSize"
              layout="prev, pager, next"
              :total="caseSets.caseSet_total"
            >
            </el-pagination>
          </el-row>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>

</template>

<script>
import {caseSetList, caseSetStick, deleteCaseSet} from '@/apis/apiTest/caseSet'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

// 错误消息组件
import errorView from '@/components/errorView'

export default {
  name: 'caseSetTree',
  components: {
    Pagination,
    errorView
  },
  props: [
    'busOnEventName',
    'busEmitEventName',
  ],
  directives: {waves},
  data() {
    return {
      //  tab页的显示
      caseSetTab: 'caseSet',

      // 树的显示规则详见element-ui
      defaultProps: {children: 'children', label: 'name'},

      // 当前选中的服务id
      projectId: '',

      // 初始化数据默认的数据
      defaultPage: {
        pageNum: 1,
        modulePageSize: 19  // 由于模块操作占了一行，所以只取19条
      },

      // 用例集列表数据
      caseSets: {
        caseSet_total: 0,
        caseSet_list: [],
        currentPage: undefined,
      },

      // 当前选中的模块
      currentCaseSet: ''

    }
  },

  methods: {

    // 点击用例集时，把用例集信息提交到用列表，用例列表根据用例集信息做相应的操作
    caseSetClick(caseSet) {
      // 把被点击的用例集数据先赋值到 caseSets.currentCaseSet ，后面点击修改的时候方便取值
      this.currentCaseSet = caseSet
      if (this.busEmitEventName) {
        this.$bus.$emit(this.busEmitEventName, caseSet)
      }
      // this.$bus.$emit(this.$busEvents.caseSetTreeChoiceCaseSet, caseSet)
    },

    // 获取该分页的用例集列表
    getCurrentPageCaseSetList(pageNum) {
      this.getCaseSetList({
        'pageNum': pageNum,
        'pageSize': this.defaultPage.modulePageSize,
        'projectId': this.projectId
      })
    },

    // 用例集操作处理函数，根据命令执行不同操作
    caseSetCommand(command) {
      if (command === 'stick') {
        this.stickCaseSet()
      } else if (command === 'del') {
        this.confirmBox(this.delCaseSet, null, this.currentCaseSet.name)
      }
      // 非置顶、非删除，则为添加/修改，方便watch监听，在指令后面加时间戳
      console.log('command: ', command)
      this.$bus.$emit(this.$busEvents.caseSetCommand, command)
    },

    // 获取用例集列表
    getCaseSetList(params) {
      caseSetList(params).then(response => {
        this.caseSets.caseSet_list = response.data.data
        this.caseSets.caseSet_total = response.data.total
      })
    },

    // 根据 projectId 获取用例集，方便操作后刷新
    getCaseSetListByProject() {
      this.getCaseSetList({
        'pageNum': this.defaultPage.pageNum,
        'pageSize': this.defaultPage.modulePageSize,
        'projectId': this.projectId
      })
    },

    // 置顶用例集
    stickCaseSet() {
      caseSetStick({
        'project_id': this.projectId,
        'id': this.currentCaseSet.id
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.getCaseSetListByProject()
        }
      })
    },

    // 删除用例集
    delCaseSet() {
      deleteCaseSet({
        'id': this.currentCaseSet.id
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.getCaseSetListByProject()
        }
      })
    }
  },

  mounted() {

    // 监听选中的服务
    if (this.busOnEventName) {
      this.$bus.$on(this.busOnEventName, (project) => {
        console.log('caseSetTree.mounted.bus.on.busOnEventName.project: ', JSON.stringify(project))
        this.projectId = project.id
        this.currentCaseSet = ''
        this.getCaseSetListByProject()
      })
    }
    // this.$bus.$on(this.$busEvents.projectTreeChoiceProject, (project) => {
    //   this.projectId = project.id
    //   this.currentCaseSet = ''
    //   this.getCaseSetListByProject()
    // })

    // 用例集 Dialog 框提交事件，提交成功后重新获取用例集列表
    this.$bus.$on(this.$busEvents.caseSetDialogCommit, () => {
      this.getCaseSetListByProject({})
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    // this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
    if (this.busOnEventName) {
      this.$bus.$off(this.busOnEventName)
    }
    this.$bus.$off(this.$busEvents.caseSetDialogCommit)
  },

  computed: {},

  watch: {}
}
</script>

<style scoped>

</style>
