<template>
  <div class="app-container">
    <el-form label-width="200px">
      <el-form-item :label="'选择历史比对类型：'" size="mini">
        <el-select
          v-model="currentProject"
          placeholder="选择历史比对类型"
          size="mini"
          style="width: 500px"
          @change="getDiffRecordListData"
        >
          <el-option
            v-for="item in projectList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>

      </el-form-item>
    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="diffRecordList"
      stripe
    >
      <el-table-column prop="id" label="数据id" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.id }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="project" label="名称" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="id" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建人'" prop="id" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="是否有改变" min-width="20%">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.is_changed === 1 ? 'danger' : 'success'">
            {{ scope.row.is_changed === 1 ? '有改变' : '没有改变' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="10%">
        <template slot-scope="scope">

          <el-button type="primary"
                     size="mini"
                     @click.native="showDetail(scope.row)">查看详情
          </el-button>

        </template>
      </el-table-column>
    </el-table>


    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="PageNum"
      :limit.sync="PageSize"
      @pagination="getDiffRecordListData"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

import {getDiffRecordList, getDiffRecordProjectList, getDiffRecord, KYMProjectList} from "@/apis/tools";
import {userList} from "@/apis/user";

export default {
  name: 'diffDecord',
  components: {Pagination},
  data() {
    return {
      // 用户列表
      user_list: [],

      // 项目列表
      projectList: [],

      // 当前选中的项目
      currentProject: '',

      // 数据列表
      diffRecordList: [],

      total: 0,
      PageNum: 1,
      PageSize: 20,


      // 加载状态
      listLoading: false,

      // 数据列表
      currentDataList: []
    }
  },

  methods: {

    // 获取项目列表
    getKYMProjectList() {
      getDiffRecordProjectList().then(response => {
        this.projectList = response.data
      })
    },

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

    // 选中项目
    getDiffRecordListData(value) {
      getDiffRecordList({
        'pageNum': this.PageNum,
        'pageSize': this.PageSize,
        'name': this.currentProject
      }).then(response => {
        this.diffRecordList = response.data.data
        this.total = response.data.total
      })
    },

    // 查看报告详情
    showDetail(row) {
      let {href} = this.$router.resolve({path: 'diffRecordShow', query: {id: row.id}})
      window.open(href, '_blank')
    }
  },

  mounted() {
    this.getUserList()
    this.getKYMProjectList()
  },
}
</script>

<style>

</style>
