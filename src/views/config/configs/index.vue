<template>
  <div class="app-container">

    <div class="filter-container">
      <el-form label-width="120px" :inline="true">

        <el-form-item :label="'选择配置类型：'" size="mini">
          <el-select
            v-model="queryType"
            :placeholder="'选择配置类型'"
            clearable
            filterable
            default-first-option
            style="margin-left: 10px; width: 100%"
            size="mini"
            class="filter-item"
            @change="getConfigList"
          >
            <el-option v-for="type in currentConfigTypeList" :key="type.id" :label="type.name" :value="type.name"/>
          </el-select>
        </el-form-item>

        <el-button class="filter-item" style="margin-left: 10px;" type="primary" size="mini" @click="addConfig">
          {{ '添加配置' }}
        </el-button>

      </el-form>
    </div>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="mailService.list"
      stripe
    >
      <el-table-column prop="id" label="编号" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="配置名称" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="value" label="配置值" min-width="28%">
        <template slot-scope="scope">
          <span> {{ scope.row.value }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="desc" label="备注" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.desc }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="type" label="配置类型" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.type }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="最后修改人" min-width="12%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="7%">
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            content="若不清楚配置的规则，请勿修改"
            placement="right-end">
            <el-button
              type="text"
              icon="el-icon-edit"
              :disabled="roles !== '2'"
              @click.native="editConfig(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="mailService.total>0"
      :total="mailService.total"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getConfigList"
    />

    <configDialog
      :config-type-list="currentConfigTypeList"
    ></configDialog>
  </div>
</template>

<script>

import Pagination from '@/components/Pagination'
import configDialog from "@/views/config/configs/drawer";

import {configList, deleteConfig} from '@/apis/config/config'
import {getUserDict} from "@/apis/user/user";
import {configTypeList} from "@/apis/config/configType";

export default {
  name: "config",
  components: {
    Pagination,
    configDialog
  },
  data() {
    return {

      queryType: '',

      // 请求列表等待响应的状态
      listLoading: false,

      mailService: {
        total: 0,
        list: [],
        currentPage: undefined,
        currentService: undefined
      },

      // 初始化数据默认的数据
      pageNum: 1,
      pageSize: 20,

      // 配置类型列表
      currentConfigTypeList: [],

      // 用户权限
      roles: localStorage.getItem('roles')
    }
  },
  methods: {

    // 获取配置类型列表
    getConfigTypeList() {
      configTypeList().then(response => {
        this.currentConfigTypeList = response.data.data
      })
    },

    // 点击编辑参数，把被点击的用例信息赋值给临时模板
    editConfig(row) {
      this.$bus.$emit(this.$busEvents.configDialogIsShow, 'edit', JSON.parse(JSON.stringify(row)))
    },

    // 添加参数
    addConfig() {
      this.$bus.$emit(this.$busEvents.configDialogIsShow, 'add')
    },

    // 把用户id解析为用户名
    parsUser(userId) {
      return this.$busEvents.userDict[userId].name
    },

    getConfigList() {
      configList({
        'type': this.queryType,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.mailService.list = response.data.data
        this.mailService.total = response.data.total
      })
    },

    // 删除配置
    delConfig(congfigId) {
      deleteConfig({'id': congfigId}).then(response => {
        if (this.showMessage(this, response)) {
          this.getConfigList()
        }
      })
    }
  },

  // 组件创建前获取用户数据
  beforeCreate() {
    getUserDict(this)  // 获取用户列表数据
  },

  mounted() {
    this.getConfigTypeList()

    this.$bus.$on(this.$busEvents.configDialogIsCommit, () => {
      this.getConfigList()
    })

    this.getConfigList()

  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.configDialogIsCommit)
  },
}
</script>

<style scoped>

</style>

