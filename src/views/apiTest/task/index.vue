<template>
  <div class="app-container">
    <el-row>

      <!-- 服务树 -->
      <el-col style="width: 15%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <!-- 服务列表树组件 -->
        <projectTreeView
          ref="projectTree"
          :busEventClickTree="$busEvents.projectTreeChoiceProject"
          :busEventClickMenu="$busEvents.taskDialogIsShow"
          :menuName="'添加任务'"
          :labelWidth="5"
        ></projectTreeView>
      </el-col>

      <!-- 定时任务 -->
      <el-col style="width: 85%">
        <!-- 定时任务列表 -->
        <el-tabs v-model="taskTab" class="table_padding" style="margin-left: 5px">
          <el-tab-pane label="定时任务列表" :name="taskTab">
            <el-table
              ref="taskTable"
              v-loading="tableLoadingIsShow"
              element-loading-text="正在排序中"
              element-loading-spinner="el-icon-loading"
              :data="taskList"
              row-key="id"
              stripe
            >
              <el-table-column prop="num" label="序号" min-width="7%">
                <template slot-scope="scope">
                  <span> {{ scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="name" label="任务名称" min-width="25%">
                <template slot-scope="scope">
                  <span> {{ scope.row.name }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="cron" label="cron表达式" min-width="35%"></el-table-column>

              <el-table-column prop="status" label="状态" min-width="9%">
                <template slot-scope="scope">
                  <el-tag size="small" :type="scope.row.status === '启用中' ? 'success' : 'warning'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="9%">
                <template slot-scope="scope">
                  <span>{{ parsUser(scope.row.create_user) }}</span>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="create_user" label="最后修改人" min-width="12%">
                <template slot-scope="scope">
                  <span>{{ parsUser(scope.row.update_user) }}</span>
                </template>
              </el-table-column>

              <el-table-column label="操作" min-width="16%">
                <template slot-scope="scope">

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="禁用任务"
                    placement="top-start">
                  <el-button
                    type="text"
                    icon="el-icon-video-pause"
                    v-if="scope.row.status === '启用中'"
                    :loading="scope.row.disableLoadingIsShow"
                    @click.native="disable(scope.row)"></el-button>
                  </el-tooltip>

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="启用任务"
                    placement="top-start">
                  <el-button
                    type="text"
                    icon="el-icon-caret-left"
                    v-if="scope.row.status === '禁用中'"
                    :loading="scope.row.enableLoadingIsShow"
                    @click.native="enable(scope.row)"></el-button>
                  </el-tooltip>

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="修改任务"
                    placement="top-start">
                    <el-button
                      type="text"
                      icon="el-icon-edit"
                      :disabled="scope.row.status === '启用中'"
                      @click.native="editTask(scope.row)"></el-button>
                  </el-tooltip>

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="复制任务"
                    placement="top-end">
                    <el-button
                      type="text"
                      icon="el-icon-document-copy"
                      :loading="scope.row.copyButtonIsLoading"
                      @click.native="copy(scope.row)"></el-button>
                  </el-tooltip>

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="运行任务"
                    placement="top-start">
                    <el-button
                      type="text"
                      icon="el-icon-video-play"
                      :loading="scope.row.runButtonIsLoading"
                      @click.native="run(scope.row)"></el-button>
                  </el-tooltip>

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="删除接口"
                    placement="top-start">
                    <el-button
                      type="text"
                      style="color: red"
                      icon="el-icon-delete"
                      :disabled="scope.row.status === '启用中'"
                      :loading="scope.row.deleteLoadingIsShow"
                      @click.native="confirmBox(delTask, scope.row, scope.row.name)"></el-button>
                  </el-tooltip>

                </template>
              </el-table-column>


            </el-table>

            <pagination
              v-show="taskTotal>0"
              :total="taskTotal"
              :page.sync="pageNum"
              :limit.sync="pageSize"
              @pagination="getTaskList"
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <taskDrawer></taskDrawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import projectTreeView from '@/components/Trees/projectTree'
import Pagination from '@/components/Pagination'
import taskDrawer from "@/views/apiTest/task/drawer";

import {taskList, disableTask, enableTask, runTask, deleteTask, copyTask, taskSort} from '@/apis/task'
import {userList} from "@/apis/user";
import {reportIsDone} from "@/apis/report";

export default {
  name: "index",
  components: {Pagination, projectTreeView, taskDrawer},
  data() {
    return {
      tableLoadingIsShow: false,
      taskTab: 'taskTab',
      taskList: [],
      projectId: '',
      taskTotal: 0,
      pageNum: 0,
      pageSize: 20,

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
    }
  },


  methods: {

    // 进入编辑
    editTask(row) {
      if (row.status === '禁用中') {
        this.$bus.$emit(this.$busEvents.taskDialogIsShow, 'update', JSON.parse(JSON.stringify(row)))
      }
    },

    // 复制任务
    copy(task) {
      this.$set(task, 'copyButtonIsLoading', true)
      copyTask({'id': task.id}).then(response => {
        this.$set(task, 'copyButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.taskList.push(response.data)
          this.editTask(response.data)
        }
      })
    },

    // 运行任务
    run(task) {
      this.$set(task, 'runButtonIsLoading', true)
      runTask({id: task.id}).then(runResponse => {
        if (this.showMessage(this, runResponse)) {

          // 触发运行成功，每三秒查询一次，
          // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
          // 已出结果，则停止查询，展示测试报告
          var that = this
          var queryCount = 0
          var timer = setInterval(function () {
            if (queryCount <= 10) {
              reportIsDone({'id': runResponse.data.report_id}).then(queryResponse => {
                if (queryResponse.data === 1) {
                  that.$set(task, 'runButtonIsLoading', false)
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.$set(task, 'runButtonIsLoading', false)
              that.$notify({
                title: '测试长时间未运行结束',
                message: '测试长时间未运行结束，不再等待，请到测试报告页查看测试报告',
                type: 'warning',
                duration: 0
              });
              clearInterval(timer)  // 关闭定时器
            }
          }, 3000)
        }
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`task.index.openReportById.reportId: ${JSON.stringify(reportId)}`)
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },

    // 删除任务
    delTask(task) {
      this.$set(task, 'deleteLoadingIsShow', true)
      deleteTask({id: task.id}).then(response => {
        this.$set(task, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 启用任务
    enable(task) {
      this.$set(task, 'enableLoadingIsShow', true)
      enableTask({id: task.id}).then(response => {
        this.$set(task, 'enableLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 禁用任务
    disable(task) {
      this.$set(task, 'disableLoadingIsShow', true)
      disableTask({id: task.id}).then(response => {
        this.$set(task, 'disableLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 获取任务列表
    getTaskList() {
      taskList({
        projectId: this.projectId,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }).then(response => {
        this.taskList = response.data.data
        this.taskTotal = response.data.total

        this.oldList = this.taskList.map(v => v.id)
        this.newList = this.oldList.slice()
      })
    },

    // 把用户id解析为用户名
    parsUser(userId) {
      for (let index in this.user_list) {
        let user_data = this.user_list[index]
        if (user_data.id === userId) {
          return user_data.name
        }
      }
    },

    // 用户列表
    getUserList() {
      userList().then(response => {
        this.user_list = response.data.data
      })
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.taskTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.taskList.splice(evt.oldIndex, 1)[0]
          this.taskList.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          taskSort({
            List: this.newList,
            pageNum: this.pageNum,
            pageSize: this.pageSize,
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    }
  },

  mounted() {
    this.getUserList()

    this.$bus.$on(this.$busEvents.taskDialogIsCommit, (status) => {
      this.getTaskList()
    })

    // 服务树选中项事件
    this.$bus.$on(this.$busEvents.projectTreeChoiceProject, (project) => {
      this.projectId = project.id
      this.getTaskList()
    })

  },

  created() {
    this.oldList = this.taskList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.taskDialogIsCommit)
    this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
  }
}
</script>

<style scoped>

</style>
