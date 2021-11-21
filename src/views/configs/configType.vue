<template>
  <div>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      @row-dblclick="doubleClick"
      :data="types.list"
      stripe
    >
      <el-table-column prop="id" label="编号" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="配置类型" min-width="45%">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="配置类型不可修改" placement="right-end">
            <span> {{ scope.row.name }} </span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="desc" label="备注" min-width="45%">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="配置类型不可修改" placement="right-end">
            <span> {{ scope.row.desc }} </span>
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="types.total>0"
      :total="types.total"
      :page.sync="defaultPage.pageNum"
      :limit.sync="defaultPage.apiPageSize"
      @pagination="getConfigTypeList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import {configTypeList} from "@/apis/configType";

export default {
  name: "configType",
  components: {
    Pagination
  },
  data() {
    return {
      // 请求列表等待响应的状态
      listLoading: false,

      types: {
        total: 0,
        list: [],
        currentPage: undefined,
        currentType: undefined
      },

      // 初始化数据默认的数据
      defaultPage: {
        pageNum: 1,
        apiPageSize: 20
      }
    }
  },

  methods: {
    doubleClick() {
    },

    getConfigTypeList() {
      configTypeList({'pageNum': this.defaultPage.pageNum, 'pageSize': this.defaultPage.apiPageSize}).then(response => {
        this.types.list = response.data.data
        this.types.total = response.data.total
        this.$bus.$emit(this.$busEvents.configTypeList, this.types.list)
      })
    }
  },
  mounted() {
    this.getConfigTypeList()
  }
}
</script>

<style scoped>

</style>
