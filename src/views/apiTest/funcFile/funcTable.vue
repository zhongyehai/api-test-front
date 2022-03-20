<template>

  <div>
    <el-table
      v-loading="listLoading"
      :data="funcFiles.list"
      stripe
    >

      <el-table-column label="序号" min-width="12%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip=true
        prop="name"
        label="文件名称"
        min-width="53%"></el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="18%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="18%">
        <template slot-scope="scope">

          <!--修改文件信息-->
          <el-button
            type="text"
            style="margin-right: 8px"
            icon="el-icon-edit"
            @click="editFuncFile(scope.row)">
          </el-button>

          <!-- 删除文件 -->
          <el-popconfirm
            placement="top"
            hide-icon
            :title="`确定删除【${scope.row.name}】?`"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="delFuncFile(scope.row)"
          >
            <el-button
              slot="reference"
              type="text"
              style="color: red"
              icon="el-icon-delete"
              :loading="scope.row.deleteLoadingIsShow"
            ></el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="funcFiles.total>0"
      :total="funcFiles.total"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getFuncFileList"
    />
  </div>

</template>

<script>
import Pagination from '@/components/Pagination'

import {funcFileList, deleteFuncFile} from '@/apis/apiTest/funcFile'
import {getUserDict} from '@/apis/user/user'

export default {
  name: "funcTable",
  components: {
    Pagination
  },
  data() {
    return {
      funcDebugData: '',
      listLoading: false,
      funcFiles: {
        list: [],
        total: 0,
      },
      pageSize: 20,
      pageNum: 1
    }
  },
  methods: {

    // 把用户id解析为用户名
    parsUser(userId) {
      return this.$busEvents.userDict[userId].name
    },

    getFuncFileList() {
      funcFileList({'pageNum': this.pageNum, 'pageSize': this.pageSize}).then(response => {
        this.funcFiles.list = response.data.data
        this.funcFiles.total = response.data.total
      })
    },

    editFuncFile(funcFile) {
      this.$bus.$emit(this.$busEvents.editFuncFile, funcFile)
    },

    delFuncFile(row) {
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteFuncFile({'name': row.name}).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getFuncFileList()
        }
      })
    },

  },

  // 组件创建前获取用户数据
  beforeCreate() {
    getUserDict(this)  // 获取用户列表数据
  },

  mounted() {
    this.getFuncFileList()

    // 修改函数文件成功，重新请求列表
    this.$bus.$on(this.$busEvents.editFuncFileIsCommit, (status) => {
      this.getFuncFileList()
    })

    // 新增函数文件成功，重新请求列表
    this.$bus.$on(this.$busEvents.addFuncFileIsCommit, (status) => {
      this.getFuncFileList()
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.addFuncFileIsCommit)
    this.$bus.$off(this.$busEvents.editFuncFileIsCommit)
  },

}
</script>

<style scoped>

</style>

