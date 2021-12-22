<template>

  <div>
    <el-table
      v-loading="listLoading"
      :data="funcFiles.list"
      stripe
    >

      <el-table-column label="序号" min-width="12%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip=true
        prop="name"
        label="文件名称"
        min-width="30%"></el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="18%">
        <template slot-scope="scope">
          <span>{{ parsUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="40%">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click.native="editFuncFile(scope.row)">
            编辑
          </el-button>
          <el-button
            type="danger"
            size="mini"
            :loading="scope.row.deleteLoadingIsShow"
            @click.native="confirmBox(delFuncFile, scope.row, scope.row.name)">
            删除
          </el-button>
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

import {funcFileList, getFuncFile, debugFuncFile, deleteFuncFile} from '@/apis/funcFile'
import {userList} from '@/apis/user'

export default {
  name: "funcTable",
  components: {
    Pagination
  },
  data() {
    return {
      funcDebugData: '',
      listLoading: false,
      userLists: [],
      funcFiles: {
        list: [],
        total: 0,
      },
      pageSize: 20,
      pageNum: 1
    }
  },
  methods: {

    // 获取用户列表
    getUserList() {
      userList().then(response => {
        this.userLists = response.data.data
      })
    },

    // 根据用户id，解析用户
    parsUser(userId) {
      for (let index in this.userLists) {
        let user_data = this.userLists[index]
        if (user_data.id === userId) {
          return user_data.name
        }
      }
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

  mounted() {
    this.getUserList()
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

