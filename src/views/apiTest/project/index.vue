<template>
  <div class="app-container">

    <!-- 搜索、添加栏 -->
    <div class="filter-container">
      <el-input v-model="listQuery.name" :placeholder="'服务名'" style="width: 400px;" class="filter-item" size="mini"
                @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.create_user" :placeholder="'选择创建人'" clearable style="margin-left: 10px" size="mini"
                 class="filter-item">
        <el-option v-for="user in user_list" :key="user.name" :label="user.name" :value="user.id"/>
      </el-select>
      <el-select v-model="listQuery.manager" :placeholder="'选择负责人'" clearable style="margin-left: 10px" size="mini"
                 class="filter-item">
        <el-option v-for="user in user_list" :key="user.name" :label="user.name" :value="user.id"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px" size="mini"
                 @click="handleFilter">
        {{ '搜索' }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" size="mini"
                 @click="addProject">
        {{ '添加' }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" size="mini"
                 @click="handleInitListQuery">
        {{ '重置' }}
      </el-button>

    </div>
    <br>

    <!-- 表格栏 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="project_list"
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="5%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'服务名'" prop="name" align="center" min-width="15%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'测试环境'" prop="test" align="center" min-width="23%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <span>{{ scope.row.test }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'负责人'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.manager) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="created_time" align="center" min-width="14%">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建人'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'最后修改人'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="17%" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">

          <el-tooltip v-show="row.yapi_id" class="item" effect="dark" content="从yapi拉取此服务下的模块、接口信息" placement="top-start">
            <el-button
              size="mini"
              icon="el-icon-refresh"
              :loading="row.isPullByYapi"
              type="text"
              @click="pullByYapi(row)">
            </el-button>
          </el-tooltip>

          <el-button size="mini" type="primary" @click="showEditForm(row)">
            {{ '修改' }}
          </el-button>

          <el-button size="mini" type="danger" :loading="row.submitButtonIsLoading" @click="confirmBox(delProject, row, row.name)">
            {{ '删除' }}
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getProjectList"/>

    <!-- 编辑框 -->
    <projectDialog
      :currentProject="currentProject"
      :currentUserList="user_list"
    ></projectDialog>

  </div>
</template>

<script>
import {deleteProject, projectList, projectPull} from '@/apis/project'
import {userList} from '@/apis/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import {parseTime} from "@/utils";
import projectDialog from '@/views/apiTest/project/dialogForm'

export default {
  name: 'Project',
  components: {
    Pagination,
    projectDialog
  },
  directives: {waves},
  data() {
    return {
      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name: undefined,  // 服务名
        manager: undefined,  // 负责人
        create_user: undefined, // 创建人
      },

      // 当前选中的服务
      currentProject: {},

      // 用户列表
      user_list: [],

      // 服务列表
      project_list: [],

      // 服务数据表格起始
      tableKey: 0,

      // 服务数据表格总条数
      total: 0,

      // dialog框状态，edit 为编辑数据, create 为新增数据
      dialogStatus: '',

      // 下载表格状态
      downloadLoading: false,

      // 请求加载状态
      listLoading: true

    }
  },

  created() {

    // 初始化用户列表
    this.getUserList()

    // 初始化服务列表
    this.getProjectList()

  },

  methods: {

    // 编辑按钮
    showEditForm(row){
      this.$bus.$emit(this.$busEvents.showProjectDialog, 'edit', row)
    },

    // 从yapi同步服务信息
    pullByYapi(row){
      this.$set(row, 'isPullByYapi', true)
      projectPull({id: row.id}).then(response => {
        this.showMessage(this, response)
        this.$set(row, 'isPullByYapi', false)
      })
    },

    // 请求用户信息
    getUserList() {
      userList().then(response => {
        this.user_list = response.data.data
      })
    },

    // 获取服务列表
    getProjectList() {
      this.listLoading = true
      projectList(this.listQuery).then(response => {
        this.project_list = response.data.data
        this.total = response.data.total
      })
      this.listLoading = false
    },

    // 删除服务
    delProject(row) {
      this.$set(row, 'submitButtonIsLoading', true)
      deleteProject({"id": row.id}).then(response => {
        this.$set(row, 'submitButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getProjectList(); // 重新从后台获取服务列表
        }
      })
    },

    // 触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getProjectList()
    },

    // 点击添加服务
    addProject() {
      this.$bus.$emit(this.$busEvents.showProjectDialog, 'add')
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

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20,
        name: undefined,  // 服务名
        manager: undefined,  // 负责人
        create_user: undefined, // 创建人
      }
    },

    // 修改排序
    sortChange(data) {
      const {prop, order} = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },

    // 修改排序
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    }
  },
  mounted() {

    this.$bus.$on(this.$busEvents.projectDialogCommitSuccess, (status) => {
      this.getProjectList()
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.projectDialogCommitSuccess)
  },

}
</script>

<style scoped>
body {
  margin: 0px
}
</style>
