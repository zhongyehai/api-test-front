<template>
  <div class="app-container">
    <div class="tabs" style="width: 100%">

      <!-- 项目列表树组件 -->
      <projectTreeView
        ref="projectTree"
        class="projectTree"
        :busEventNameOneClick="$busEvents.projectTreeChoiceProject"
        :busEventNameTwoClick="$busEvents.taskDialogIsShow"
      ></projectTreeView>


      <!-- 定时任务列表 -->
      <el-tabs v-model="taskTab" class="table_padding taskTab">

        <!-- 用例管理 -->
        <el-tab-pane label="定时任务列表" :name="taskTab">

          <!-- 根据当前窗口宽度，实时计算用例列表能展示的宽度 -->
          <el-row :style="{'min-width': caseSetListTableWidth}">

            <el-col :span="21" style="padding-left: 5px;">
              <el-table
                ref="taskTable"
                :data="taskList"
                stripe
              >
                <el-table-column prop="num" label="编号" min-width="5%"></el-table-column>

                <el-table-column :show-overflow-tooltip=true prop="name" label="任务名称" min-width="22%">
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

                <el-table-column label="操作" min-width="30%">
                  <template slot-scope="scope">
                    <el-button
                      type="primary"
                      size="mini"
                      v-if="scope.row.status === '启用中'"
                      @click.native="disable(scope.row.id)"
                    >禁用
                    </el-button>

                    <el-button
                      type="primary"
                      size="mini"
                      v-if="scope.row.status === '禁用中'"
                      @click.native="enable(scope.row.id)"
                    >启用
                    </el-button>

                    <el-button
                      type="primary"
                      size="mini"
                      :disabled="scope.row.status === '启用中'"
                      @click.native="editTask(scope.row)"
                    >修改
                    </el-button>

                    <el-button
                      type="success"
                      size="mini"
                      :loading="scope.row.isShow"
                      @click.native="run(scope.row.id)"
                    >运行
                    </el-button>

                    <el-button type="danger"
                               size="mini"
                               @click.native="confirmBox(delTask, scope.row.id, scope.row.name)"
                    >删除
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
            </el-col>
          </el-row>
        </el-tab-pane>

      </el-tabs>

      <taskDialogView></taskDialogView>
    </div>
  </div>
</template>

<script>
import projectTreeView from '@/components/Trees/projectTree'
import Pagination from '@/components/Pagination'
import taskDialogView from "@/views/task/taskDialog";

import {taskList, disableTask, enableTask, runTask, deleteTask} from '@/apis/task'
import {userList} from "@/apis/user";

export default {
  name: "index",
  components: {Pagination, projectTreeView, taskDialogView},
  data() {
    return {
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
    run(taskId) {
      runTask({id: taskId}).then(response => {
        if (this.showMessage(this, response)) {
          this.openReportById(response.data.report_id)
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
    delTask(taskId) {
      deleteTask({id: taskId}).then(response => {
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 启用任务
    enable(taskId) {
      enableTask({id: taskId}).then(response => {
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 禁用任务
    disable(taskId) {
      disableTask({id: taskId}).then(response => {
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

    this.$bus.$on(this.$busEvents.projectTreeChoiceProject, (project) => {
      this.projectId = project.id
      this.getTaskList()
    })

  },

  // 页面销毁前，关闭bus监听项目选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.taskDialogIsCommit)
    this.$bus.$off(this.$busEvents.projectTreeChoiceProject)
  },

  computed: {
    // 用例列表能用的宽度
    caseSetListTableWidth() {
      return `${window.innerWidth - 700}px`
    }
  },
}
</script>

<style scoped>
.projectTree {
  float: left;
  width: 200px;
}

</style>
