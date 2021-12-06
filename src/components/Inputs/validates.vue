<template>

  <!-- 断言 -->
  <el-table :data="tempValidates"
            size="mini"
            stripe
            :show-header="false"
            class="h-b-e-a-style"
            :row-style="{'background-color': 'rgb(250, 250, 250)'}">

    <el-table-column property="key" label="Key" header-align="center" min-width="25%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.key" size="mini" placeholder="实际结果提取表达式">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="validate_type" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-select v-model="scope.row.validate_type"
                   placeholder="断言类型"
                   size="mini">
          <el-option
            v-for="(item) in validateTypeList"
            :key="item.value"
            :label="item.value"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
    </el-table-column>

    <el-table-column property="value" label="Value" header-align="center" min-width="25%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.value"
                  size="mini"
                  :type="['契约校验', 'json相等'].indexOf(scope.row.validate_type) !== -1 ? 'textarea' : 'text'"
                  :placeholder="
                  scope.row.validate_type === '契约校验' ?
                  '详见：https://pypi.org/project/pactverify/，注：契约校验标识符改用@':
                  '预期结果，严格区分字符类型，字符串请加英文的引号：‘123’'
                ">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="备注" header-align="center" min-width="13%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.remark" size="mini" placeholder="备注">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="添加" header-align="center" min-width="8%">
      <template slot-scope="scope">
        <el-button v-show="isShowAddButton(scope.$index)"
                   type="primary"
                   size="mini"
                   @click.native="addRow(scope.$index)">+
        </el-button>
      </template>
    </el-table-column>

    <el-table-column label="删除" header-align="center" min-width="8%">
      <template slot-scope="scope">
        <el-button v-show="isShowDelButton(scope.$index)"
                   type="danger"
                   size="mini"
                   @click.native="delRow(scope.$index)">-
        </el-button>
      </template>
    </el-table-column>

  </el-table>
</template>

<script>

import {getAssertMapping} from '@/apis/api'

export default {
  name: "validates",
  props: ['validates'],

  mounted() {
    if (this.validateTypeList.length === 0) {
      this.getAssertMappings()
    }
  },

  created() {
    this.tempValidates = this.validates || [{
      key: null,
      value: null,
      validate_type: null,
      remark: null
    }]
  },

  data() {
    return {
      validateTypeList: [],
      tempValidates: [{key: null, value: null, validate_type: null, remark: null}]
    }
  },

  methods: {

    // 从后端获取断言方式
    getAssertMappings() {
      getAssertMapping().then(response => {
        this.validateTypeList = response.data
      })
    },

    // 是否显示添加按钮
    isShowAddButton(index) {
      return index === this.tempValidates.length - 1
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempValidates.length === 1 && index === 0)
    },

    // 添加一行
    addRow() {
      this.tempValidates.push({key: null, value: null, validate_type: null, remark: null})
    },

    // 删除一行
    delRow(index) {
      this.tempValidates.splice(index, 1);
    },
  },

  watch: {
    'validates': {
      handler(newVal, oldVal) {
        this.tempValidates = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
