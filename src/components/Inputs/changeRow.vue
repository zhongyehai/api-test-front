<template>
  <el-table :data="tempData" stripe :show-header="false" size="mini">
    <el-table-column label="Key" header-align="center" min-width="30%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.key" size="mini" :placeholder="placeholderKey">
        </el-input>
      </template>
    </el-table-column>
    <el-table-column label="Value" header-align="center" min-width="30%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.value" size="mini" :placeholder="placeholderValue">
        </el-input>
      </template>
    </el-table-column>
    <el-table-column label="备注" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.remark" size="mini" :placeholder="placeholderDesc">
        </el-input>
      </template>
    </el-table-column>
    <el-table-column label="添加" header-align="center" min-width="8%">
      <template slot-scope="scope">
        <el-button v-show="isShowAddButton( scope.$index)"
                   type="primary"
                   size="mini"

                   @click.native="addRow(scope.$index)"
        >+
<!--          icon="el-icon-plus"-->
        </el-button>
      </template>
    </el-table-column>
    <el-table-column label="删除" header-align="center" min-width="8%">
      <template slot-scope="scope">
        <el-button v-show="isShowDelButton(scope.$index)"
                   type="danger"
                   size="mini"

                   @click.native="delRow(scope.$index)"
        >-
<!--          icon="el-icon-minus"-->
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'changeRow',
  props: [
    'currentData',
    'placeholderKey',
    'placeholderValue',
    'placeholderDesc'
  ],
  data() {
    return {
      tempData: []
    }
  },
  methods: {

    // 是否显示添加按钮
    isShowAddButton(index) {
      return index === this.tempData.length - 1
    },

    // 添加一行
    addRow() {
      this.tempData.push({key: null, value: null, remark: null})
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(i) {
      this.tempData.splice(i, 1)
    }
  },
  created() {
    this.tempData = this.currentData
  },
  watch: {
    'currentData': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.tempData = newVal
        } else {
          this.tempData = [{key: null, value: null, remark: null}]
        }
      }
    },

    // 如果临时数据长度为0，则添加一行
    'tempData': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal.length === 0) {
          this.addRow()
        }
      }
    }

  }
}
</script>

<style scoped>

</style>
