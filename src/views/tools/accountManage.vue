<template>
  <div class="app-container">

    <el-form label-width="120px">
      <el-form-item :label="'选择环境：'" size="mini">
        <el-select
          v-model="currentEvent"
          placeholder="请选择环境"
          size="small"
          @change="selectType"
        >
          <el-option
            v-for="item in eventList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>

        <el-button type="primary" @click.native="showDialog('')" size="small" style="margin-left: 20px">添加账号</el-button>

      </el-form-item>
    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="currentAccountList"
      stripe
    >
      <el-table-column prop="id" label="编号" min-width="5%">
        <template slot-scope="scope">
          <span> {{ scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="project" label="项目" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.project }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="账户名" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="account" label="账号" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.account }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="password" label="密码" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.password }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="desc" label="备注" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.desc }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建人'" prop="id" align="center" min-width="15%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="20%">
        <template slot-scope="scope">

          <el-button type="primary"
                     size="mini"
                     @click.native="showDialog(scope.row)">修改
          </el-button>

          <el-button type="danger"
                     size="mini"
                     :loading="scope.row.deleteButtonIsLoading"
                     @click.native="confirmBox(delAccount, scope.row, scope.row.name)">删除
          </el-button>

        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/修改账号表单 -->
    <el-dialog
      :close-on-click-modal="false"
      :title=" currentAccount.id ? '修改模块' : '新增模块' "
      :visible.sync="dialogIsShow"
      width="40%">
      <!--      :rules="rules"-->
      <el-form
        ref="dataForm"
        :model="currentAccount"
        label-position="right"
        label-width="90px"
        style="min-width: 400px;">
        <el-form-item :label="'项目名'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="currentAccount.project" placeholder="项目名称"/>
        </el-form-item>
        <el-form-item :label="'账户名称'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="currentAccount.name" placeholder="账户名称"/>
        </el-form-item>
        <el-form-item :label="'登录账号'" class="filter-item is-required" prop="account" size="mini">
          <el-input v-model="currentAccount.account" placeholder="登录账号，不可重复"/>
        </el-form-item>
        <el-form-item :label="'登录密码'" class="filter-item is-required" prop="password" size="mini">
          <el-input v-model="currentAccount.password" placeholder="登录密码"/>
        </el-form-item>
        <el-form-item :label="'备注'" class="filter-item" prop="desc" size="mini">
          <el-input type="textarea" v-model="currentAccount.desc" placeholder="备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click=" currentAccount.id ? changeAccount() : addAccount() ">
          {{ '确定' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="PageNum"
      :limit.sync="PageSize"
      @pagination="getAccountList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import {userList} from '@/apis/user'
import {accountList, postAccount, getAccount, putAccount, deleteAccount} from "@/apis/tools";

export default {
  name: 'accountManage',
  components: {Pagination},
  data() {
    return {
      // 加载状态
      listLoading: false,

      submitButtonIsLoading: false,
      deleteButtonIsLoading: false,

      // Dialog状态
      dialogIsShow: false,

      // 选中的环境
      currentEvent: 'test',

      // 文件类型列表
      eventList: [
        {'key': 'dev', 'value': 'dev环境'},
        {'key': 'test', 'value': '测试环境'},
        {'key': 'uat', 'value': 'uat环境'}
      ],

      // 用户列表
      user_list: [],
      // 账号列表
      currentAccountList: [],
      // 账号
      currentAccount: {
        id: '',
        project: '',
        name: '',
        account: '',
        password: '',
        desc: '',
        event: ''
      },

      total: 0,
      PageNum: 1,
      PageSize: 20
    }
  },

  methods: {

    // 请求用户信息
    getUserList() {
      userList().then(response => {
        this.user_list = response.data.data
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

    // 获取账号列表
    getAccountList() {
      accountList({
        'pageNum': this.PageNum,
        'pageSize': this.PageSize,
        'event': this.currentEvent
      }).then(response => {
        this.currentAccountList = response.data.data
        this.total = response.data.total
      })
    },

    // 选中事件
    selectType(value) {
      this.PageNum = 1
      this.PageSize = 20
      this.getAccountList()
    },

    initNewAccount() {
      this.currentAccount.id = ''
      this.currentAccount.project = ''
      this.currentAccount.name = ''
      this.currentAccount.account = ''
      this.currentAccount.password = ''
      this.currentAccount.desc = ''
      this.currentAccount.event = ''
    },

    // 打开 dialog
    showDialog(row) {
      if (row) {  // 修改
        this.currentAccount = JSON.parse(JSON.stringify(row))
      } else {  // 增加
        this.initNewAccount()
      }
      this.dialogIsShow = true
    },

    // 添加账号
    addAccount() {
      this.submitButtonIsLoading = true
      postAccount({
        project: this.currentAccount.project,
        name: this.currentAccount.name,
        account: this.currentAccount.account,
        password: this.currentAccount.password,
        desc: this.currentAccount.desc,
        event: this.currentEvent
      }).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.dialogIsShow = false
          this.getAccountList()
        }
      })
    },

    // 修改账号
    changeAccount() {
      this.submitButtonIsLoading = true
      putAccount({
        id: this.currentAccount.id,
        project: this.currentAccount.project,
        name: this.currentAccount.name,
        account: this.currentAccount.account,
        password: this.currentAccount.password,
        desc: this.currentAccount.desc,
        event: this.currentEvent
      }).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.dialogIsShow = false
          this.getAccountList()
        }
      })
    },

    // 删除账号
    delAccount(row) {
      this.$set(row, 'deleteButtonIsLoading', true)
      deleteAccount({'id': row.id}).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getAccountList()
        }
      })
    }
  },

  mounted() {
    this.getUserList()
    this.getAccountList()
  },
}
</script>

<style>

</style>
