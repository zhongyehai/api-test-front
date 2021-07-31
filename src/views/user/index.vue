<template>
  <div class="app-container">

    <!-- 搜索、添加栏 -->
    <div class="filter-container">
      <el-input v-model="listQuery.name" :placeholder="'用户名'" style="width: 200px;" class="filter-item" size="mini"
                @keyup.enter.native="handleFilter"/>
      <el-input v-model="listQuery.account" :placeholder="'账号'" style="width: 200px;margin-left: 10px"
                class="filter-item" size="mini"
                @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.status" :placeholder="'状态'" clearable style="margin-left: 10px" size="mini"
                 class="filter-item">
        <el-option v-for="status in status_list" :key="status.name" :label="status.name" :value="status.id"/>
      </el-select>
      <el-select v-model="listQuery.role_id" :placeholder="'角色'" clearable style="margin-left: 10px" size="mini"
                 class="filter-item">
        <el-option v-for="role in role_list" :key="role.name" :label="role.name" :value="role.id"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px" icon="el-icon-search" size="mini"
                 @click="handleFilter">
        {{ '搜索' }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" size="mini"
                 @click="handleCreate">
        {{ '添加' }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" size="mini"
                 @click="handleInitListQuery">
        {{ '重置' }}
      </el-button>
    </div>
    <br>

    <!-- 表格栏 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="user_list"
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'用户名'" prop="id" align="center" min-width="25%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'账号'" prop="id" align="center" min-width="25%">
        <template slot-scope="scope">
          <span>{{ scope.row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'状态'" prop="id" align="center" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.status === 1 ? '启用中' : '禁用中' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'角色'" prop="id" align="center" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.role_id === 1 ? '测试人员' : '管理人员' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'操作'" align="center" min-width="20%" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <!--          <el-button type="primary" size="mini" @click="handleUpdate(row)">-->
          <el-button :type="row.status === 1 ? 'info' : 'success'" size="mini" @click="changStatus(row.id)">
            {{ row.status === 1 ? '冻结' : '启用' }}
          </el-button>
          <el-button size="mini" type="danger" @click="confirmBox(delUser, row.id, row.name)">
            删除
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
      @pagination="getUserList"/>

    <!-- 新增/修改表单 -->
    <el-dialog :title=" dialogStatus==='create'?'新增用户':'修改用户'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="tempUser" label-position="left" label-width="70px"
               style="min-width: 400px;">

        <!-- 用户信息 -->
        <el-form-item :label="'用户名'" prop="name" class="filter-item" size="mini">
          <el-input v-model="tempUser.name" placeholder="不小于6位"/>
        </el-form-item>
        <el-form-item :label="'账号'" prop="name" class="filter-item" size="mini">
          <el-input v-model="tempUser.account" placeholder="不小于6位"/>
        </el-form-item>
        <el-form-item :label="'密码'" prop="name" class="filter-item" size="mini">
          <el-input v-model="tempUser.password" placeholder="不小于6位"/>
        </el-form-item>
        <el-form-item :label="'角色'" class="filter-item" size="mini">
          <el-select v-model="tempUser.role_id" class="filter-item" placeholder="请选择角色">
            <el-option
              v-for="role in role_list"
              :key="role.name"
              :label="role.name"
              :value="role.id"/>
          </el-select>
        </el-form-item>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> {{ '取消' }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?addUser():changUser()">
          {{ '确定' }}
        </el-button>
      </div>

    </el-dialog>

  </div>
</template>

<script>
import {userList, deleteUser, postUser, putUser, getUser, roleList, userStatus} from '@/apis/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
  components: {Pagination},
  directives: {waves},
  data() {
    return {
      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name: undefined,  // 用户名
        account: undefined,  // 账号
        status: undefined, // 账号状态
        role_id: undefined // 角色
      },

      // 临时数据，添加、修改
      tempUser: {
        id: undefined,
        name: undefined,
        account: undefined,
        role_id: undefined,
        password: undefined,
      },

      // 用户列表
      user_list: [],

      // 角色列表
      role_list: [],

      // 状态列表
      status_list: [],

      // 项目数据表格起始
      tableKey: 0,

      // 项目数据表格总条数
      total: 0,

      // 编辑框的显示状态
      dialogFormVisible: false,

      // dialog框状态，edit为编辑数据, create为新增数据
      dialogStatus: '',

      // 请求加载状态
      listLoading: true,


      rules: {
        type: [{required: true, message: '类型必填', trigger: 'change'}],
        timestamp: [{type: 'date', required: true, message: '时间必填', trigger: 'change'}],
        title: [{required: true, message: '标题必填', trigger: 'blur'}]
      },

    }
  },

  created() {
    // 初始化用户状态
    this.initStatus()

    // 初始化角色列表
    this.getRoleList()

    // 初始化用户列表
    this.getUserList()

    // 初始化临时数据
    this.initTempUser()
  },
  mounted() {
  },
  methods: {
    //===================================== 初始化数据 相关 start ===================================
    // 初始化用户状态
    initStatus() {
      this.status_list = [{'id': 1, name: '启用'}, {'id': 2, name: '冻结'}]
    },

    // 初始化临时项目数据
    initTempUser() {
      this.tempUser = {
        id: undefined,
        name: undefined,
        account: undefined,
        password: undefined,
        role_id: undefined
      }
    },

    // 初始化临时模板数据，点击新增按钮触发
    handleCreate() {
      this.initTempUser()
      this.dialogStatus = 'create'  // dialog框标识为创建
      this.dialogFormVisible = true
    },

    //  初始化临时模板数据，点击修改按钮触发
    handleUpdate(row) {
      this.dialogStatus = 'edit'  // dialog框标识为编辑
      this.tempUser.id = row.id
      this.tempUser.name = row.name
      this.tempUser.account = row.account
      this.tempUser.password = row.password
      this.tempUser.role_id = row.role_id
      this.dialogFormVisible = true
    },

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20,
        name: undefined,  // 项目名
        manager: undefined,  // 负责人
        create_user: undefined, // 创建人
      }
    },
    //===================================== 初始化数据 相关 end =====================================


    //===================================== 请求相关 start =====================================
    // 获取角色列表
    getRoleList() {
      roleList().then(response => {
        this.role_list = response.data
      })
    },

    // 用户列表
    getUserList() {
      userList(this.listQuery).then(response => {
        this.user_list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },

    // 新增用户
    addUser() {
      postUser(this.tempUser).then(response => {
        if (this.showMessage(this, response)) {
          this.dialogFormVisible = false
          this.initTempUser(); // 初始化临时数据模板
          this.getUserList(); // 重新从后台获取项目列表
        }
      })
    },

    // 修改用户
    changUser() {
      putUser(this.tempUser).then(response => {
        if (this.showMessage(this, response)) {
          this.dialogFormVisible = false
          this.initTempUser(); // 初始化临时数据模板
          this.getUserList(); // 重新从后台获取项目列表
        }
      })
    },

    // 删除用户
    delUser(userId) {
      deleteUser({
        "id": userId
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.getUserList(); // 重新从后台获取用户列表
        }
      })
    },

    // 启用禁用用户
    changStatus(userId) {
      userStatus({
        'id': userId
      }).then(response => {
        this.showMessage(this, response)
        this.getUserList()
      })
    },

    // 触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getUserList()
    },
    //===================================== 请求相关 end =====================================

  },
  computed: {
    // 获取host的值，方便监听，增加行
    // monitorHostRows(){
    //   console.log(`触发了project.computed.monitorHostRows`)
    //   console.log(`project.this.tempUser.hosts: ${this.tempUser.hosts}`)
    //   return this.tempUser.hosts
    // }
  },

  watch: {
    // 如果没有输入框，则加一个输入框，如果有输入框，且最后一个输入框不是空的，则新增一个输入框
    // monitorHostRows(){
    //   console.log(`触发了project.watch.monitorHostRows`)
    //   console.log(`project.this.tempUser.hosts.length: ${this.tempUser.hosts.length}`)
    //   console.log(`project.this.tempUser.hosts[this.tempUser.hosts.length -1].value: ${this.tempUser.hosts[this.tempUser.hosts.length -1].value}`)
    //   if(this.tempUser.hosts.length === 0 || this.tempUser.hosts[this.tempUser.hosts.length -1].value){
    //     this.addHostRow()
    //   }
    // }
  },
}
</script>
