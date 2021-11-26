<template>
  <div class="app-container">
    <el-row>

      <!-- 项目树 -->
      <el-col style="width: 20%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <!-- 项目列表树组件 -->
        <projectTreeView
          ref="projectTree"
          :busEventClickTree="$busEvents.projectTreeChoiceProject"
          :busEventClickMenu="$busEvents.taskDialogIsShow"
          :menuName="'添加任务'"
          :labelWidth="15"
        ></projectTreeView>
      </el-col>

      <!-- 定时任务 -->
      <el-col style="width: 80%">
        <!-- 定时任务列表 -->
        <el-tabs v-model="taskTab" class="table_padding" style="margin-left: 5px">
          <el-tab-pane label="定时任务列表" :name="taskTab">
            <el-table
              ref="taskTable"
              :data="taskList"
              stripe
            >
              <el-table-column prop="num" label="序号" min-width="7%">
                <template slot-scope="scope">
                  <span> {{ scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="name" label="任务名称" min-width="11%">
                <template slot-scope="scope">
                  <span> {{ scope.row.name }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="cron" label="cron表达式" min-width="25%"></el-table-column>

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

              <el-table-column label="操作" min-width="39%">
                <template slot-scope="scope">

                  <el-button
                    type="primary"
                    size="mini"
                    v-if="scope.row.status === '启用中'"
                    :loading="scope.row.disableLoadingIsShow"
                    @click.native="disable(scope.row)">禁用
                  </el-button>

                  <el-button
                    type="primary"
                    size="mini"
                    v-if="scope.row.status === '禁用中'"
                    :loading="scope.row.enableLoadingIsShow"
                    @click.native="enable(scope.row)">启用
                  </el-button>

                  <el-button
                    type="primary"
                    size="mini"
                    :disabled="scope.row.status === '启用中'"
                    @click.native="editTask(scope.row)">修改
                  </el-button>

                  <el-button
                    type="success"
                    size="mini"
                    :loading="scope.row.isLoading"
                    @click.native="run(scope.row)">运行
                  </el-button>

                  <el-button type="danger"
                             size="mini"
                             :disabled="scope.row.status === '启用中'"
                             :loading="scope.row.deleteLoadingIsShow"
                             @click.native="confirmBox(delTask, scope.row, scope.row.name)">删除
                  </el-button>

                </template>
              </el-table-column>


            </el-table>

            <pagination
              v-show="taskTotal>0"
              :total="taskTotal"
              :page.sync="PageNum"
              :limit.sync="PageSize"
              @pagination="getTaskList"
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <taskDialogView></taskDialogView>
  </div>
</template>

<script>
import projectTreeView from '@/components/Trees/projectTree'
import Pagination from '@/components/Pagination'
import taskDialogView from "@/views/task/taskDialog";

import {taskList, disableTask, enableTask, runTask, deleteTask} from '@/apis/task'
import {userList} from "@/apis/user";
import {reportIsDone} from "@/apis/report";

export default {
  name: "index",
  components: {Pagination, projectTreeView, taskDialogView},
  data() {
    return {
      enableLoadingIsShow: false,
      disableLoadingIsShow: false,
      deleteLoadingIsShow: false,
      taskTab: 'taskTab',
      taskList: [],
      projectId: '',
      taskTotal: 0,
      PageNum: 0,
      PageSize: 20
    }
  },


  methods: {

    // 进入编辑
    editTask(row) {
      if (row.status === '禁用中') {
        this.$bus.$emit(this.$busEvents.taskDialogIsShow, 'update', JSON.parse(JSON.stringify(row)))
      }
    },

    // 运行任务
    run(task) {
      this.$set(task, 'isLoading', true)
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
                  that.$set(task, 'isLoading', false)
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.$set(task, 'isLoading', false)
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
    delTask(row) {
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteTask({id: row.id}).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 启用任务
    enable(row) {
      this.$set(row, 'enableLoadingIsShow', true)
      enableTask({id: row.id}).then(response => {
        this.$set(row, 'enableLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 禁用任务
    disable(row) {
      this.$set(row, 'disableLoadingIsShow', true)
      disableTask({id: row.id}).then(response => {
        this.$set(row, 'disableLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },


    getTaskList() {
      taskList({projectId: this.projectId, PageNum: this.PageNum, PageSize: this.PageSize,}).then(response => {
        this.taskList = response.data.data
        this.taskTotal = response.data.total
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

  },

  mounted() {
    this.getUserList()

    this.$bus.$on(this.$busEvents.taskDialogIsCommit, (status) => {
      this.getTaskList()
    })

    // 项目树选中项事件
    this.$bus.$on(this.$busEvents.projectTreeChoiceProject, (project) => {
      this.projectId = project.id
      this.getTaskList()
    })

  },

  // 页面销毁前，关闭bus监听项目选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.taskDialogIsCommit)
    this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
  }
}
</script>

<style scoped>

</style>
