<template>
  <div class="app-container">

    <!-- 搜索、添加栏 -->
    <div class="filter-container">

      <!-- inline="true"，el-form-item不自动换行 -->
      <el-form label-width="100px" :inline="true">

        <el-form-item :label="'服务名：'" size="mini">
          <el-select
            ref="projectSelector"
            v-model="listQuery.projectId"
            :placeholder="'选择服务名'"
            filterable
            default-first-option
            clearable
            size="mini"
            class="filter-item">
            <el-option v-for="project in project_list" :key="project.id" :label="project.name" :value="project.id"/>
          </el-select>
        </el-form-item>

        <el-form-item :label="'创建人：'" size="mini">
          <el-select
            v-model="listQuery.create_user"
            :placeholder="'选择创建人'"
            filterable
            default-first-option
            clearable
            size="mini"
            class="filter-item">
            <el-option v-for="user in userList" :key="user.name" :label="user.name" :value="user.id"/>
          </el-select>
        </el-form-item>

        <el-form-item :label="'负责人：'" size="mini">
          <el-select
            v-model="listQuery.manager"
            :placeholder="'选择负责人'"
            filterable
            default-first-option
            clearable
            size="mini"
            class="filter-item">
            <el-option v-for="user in userList" :key="user.name" :label="user.name" :value="user.id"/>
          </el-select>
        </el-form-item>

        <el-button
          v-waves
          type="primary"
          size="mini"
          @click="handleFilter">
          {{ '搜索' }}
        </el-button>

        <el-button
          type="primary"
          size="mini"
          @click="addProject">
          {{ '添加' }}
        </el-button>

        <el-button
          type="primary"
          size="mini"
          @click="handleInitListQuery">
          {{ '重置' }}
        </el-button>

        <el-tooltip
          class="item"
          effect="dark"
          content="从yapi拉取项目列表"
          placement="top-start">
          <el-button
            type="primary"
            size="mini"
            :loading="pullYapiProjectIsLoading"
            @click="pullYapiProject">
            {{ '从yapi拉取' }}
          </el-button>
        </el-tooltip>
      </el-form>
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
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'服务名'" prop="name" align="center" min-width="17%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'测试环境'" prop="test" align="center" min-width="28%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <div v-if="scope.row.test">
            <span>{{ scope.row.test }}</span>
          </div>
          <div v-else>
            <el-tag type="danger">请设置测试环境地址</el-tag>
          </div>
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

      <el-table-column :label="'操作'" align="center" min-width="10%" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">

          <!-- 从yapi拉取此服务下的模块、接口信息 -->
          <el-popconfirm
            v-show="row.yapi_id"
            placement="top"
            hide-icon
            style="margin-right: 10px"
            title="从yapi拉取此服务下的模块、接口信息?"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="pullByYapi(row)"
          >
            <el-button
              slot="reference"
              type="text"
              icon="el-icon-refresh"
              :loading="row.isPullByYapi"
            ></el-button>
          </el-popconfirm>

          <!-- 从swagger拉取模块、接口信息-->
          <el-popconfirm
            v-show="!row.yapi_id && row.swagger"
            placement="top"
            hide-icon
            style="margin-right: 10px"
            title="从swagger拉取此服务下的模块、接口信息?"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="pullBySwagger(row)"
          >
            <el-button
              slot="reference"
              type="text"
              icon="el-icon-refresh"
              :loading="row.isPullBySwagger"
            ></el-button>
          </el-popconfirm>

          <!-- 编辑服务 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            icon="el-icon-edit"
            @click="showEditForm(row)">
          </el-button>

          <!--删除服务-->
          <el-popconfirm
            placement="top"
            hide-icon
            style="margin-right: 10px"
            :title="`确定删除【${row.name}】?`"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="delProject(row)"
          >
            <el-button
              slot="reference"
              type="text"
              style="color: red"
              icon="el-icon-delete"
              :loading="row.deleteButtonIsLoading"
            ></el-button>
          </el-popconfirm>
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

    <!-- 抽屉 -->
    <projectDrawer
      :currentProject="currentProject"
      :currentUserList="$busEvents.userList"
    ></projectDrawer>

  </div>
</template>

<script>
import {deleteProject, projectList} from '@/apis/apiTest/project'
import {yapiPull, yapiPullProject} from '@/apis/testWork/yapi'
import {swaggerPull} from '@/apis/testWork/swagger'
import {getUserDict} from '@/apis/user/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import projectDrawer from '@/views/apiTest/project/drawer'

export default {
  name: 'Project',
  components: {
    Pagination,
    projectDrawer
  },
  directives: {waves},
  data() {
    return {
      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        projectId: '',  // 服务id
        manager: '',  // 负责人
        create_user: '', // 创建人
      },

      // 当前选中的服务
      currentProject: {},

      // 用户列表
      userList: [],

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
      listLoading: true,

      pullYapiProjectIsLoading: false
    }
  },

  // 组件创建前获取用户数据
  beforeCreate() {
    getUserDict(this)  // 获取用户列表数据
  },

  created() {
    this.userList = this.$busEvents.userList  // 初始化用户列表

    // 初始化服务列表
    this.getProjectList()

  },

  methods: {

    // 编辑按钮
    showEditForm(row) {
      this.$bus.$emit(this.$busEvents.showProjectDialog, 'edit', row)
    },

    // 从yapi同步服务信息
    pullByYapi(row) {
      this.$set(row, 'isPullByYapi', true)
      yapiPull({id: row.id}).then(response => {
        this.showMessage(this, response)
        this.$set(row, 'isPullByYapi', false)
      })
    },

    // 从yapi同步服务信息
    pullYapiProject(row) {
      this.pullYapiProjectIsLoading = true
      yapiPullProject({}).then(response => {
        this.pullYapiProjectIsLoading = false
        if (this.showMessage(this, response)) {
          this.getProjectList()
        }
      })
    },

    // 从swagger同步服务信息
    pullBySwagger(row) {
      this.$set(row, 'isPullBySwagger', true)
      swaggerPull({id: row.id}).then(response => {
        this.showMessage(this, response)
        this.$set(row, 'isPullBySwagger', false)
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
      this.$set(row, 'deleteButtonIsLoading', true)
      deleteProject({"id": row.id}).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
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
      return this.$busEvents.userDict[userId].name
    },

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20,
        projectId: '',  // 服务id
        manager: '',  // 负责人
        create_user: '', // 创建人
      }
      this.getProjectList()
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

    // test环境修改后，前端页面也跟随修改域名
    this.$bus.$on(this.$busEvents.envIsCommit, (projectId, host) => {
      try {
        this.project_list.forEach(row => {
          if (row.id === projectId) {
            this.$set(row, 'test', host)
            throw new Error('遍历结束')
          }
        })
      } catch (error) {
        if (error.message !== '遍历结束') throw error
      }
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
