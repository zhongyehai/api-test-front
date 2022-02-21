<template>

  <!-- 断言 -->
  <el-table
    :data="tempValidates"
    size="mini"
    stripe
    :show-header="false"
    class="h-b-e-a-style"
    :row-style="{'background-color': 'rgb(250, 250, 250)'}">

    <el-table-column label="数据源" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-row>
          <el-row>
            <el-select
              v-model="scope.row.data_source"
              placeholder="选择数据源"
              style="width: 100%"
              filterable
              clearable
              default-first-option
              size="mini">
              <el-option
                v-for="(item) in responseDataSourceMapping"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-row>
          <el-row>
            <el-input
              v-model="scope.row.key"
              type="textarea"
              size="mini"
              :rows="1"
              :placeholder="getDataSourcePlaceholder(scope.row.data_source)"></el-input>
          </el-row>
        </el-row>

      </template>
    </el-table-column>

    <el-table-column label="validate_type" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-select
          v-model="scope.row.validate_type"
          placeholder="断言类型"
          style="width: 100%"
          filterable
          clearable
          default-first-option
          size="mini"
          @change="selectValidateType($event, scope.row)"
        >
          <el-option
            v-for="(item) in validateTypeList"
            :key="item.value"
            :label="item.value"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
    </el-table-column>

    <el-table-column property="value" label="Value" header-align="center" min-width="29%">
      <template slot-scope="scope">
        <el-row>
          <el-row>
            <el-select
              v-model="scope.row.data_type"
              placeholder="选择数据类型"
              :disabled="scope.row.validate_type === '值为真' || scope.row.validate_type === '值为假'"
              style="width: 100%"
              filterable
              clearable
              default-first-option
              size="mini">
              <el-option
                v-for="(item) in dataTypeMapping"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-row>
          <el-row>
            <el-input
              v-model="scope.row.value"
              size="mini"
              type="textarea"
              :disabled="scope.row.validate_type === '值为真' || scope.row.validate_type === '值为假'"
              :rows="1"
              :placeholder="
                  scope.row.validate_type === '契约校验' ?
                  '详见：https://pypi.org/project/pactverify/，注：契约校验标识符改用@':
                  '预期结果'
                ">
            </el-input>
          </el-row>
        </el-row>
      </template>
    </el-table-column>

    <el-table-column label="添加一行" header-align="center" min-width="4%">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
          <el-button
            v-show="isShowAddButton(scope.$index)"
            type="text"
            size="mini"
            icon="el-icon-plus"
            @click.native="addRow(scope.$index)">
          </el-button>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column label="删除当前行" header-align="center" min-width="4%">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
          <el-button
            v-show="isShowDelButton(scope.$index)"
            type="text"
            size="mini"
            icon="el-icon-minus"
            style="color: red"
            @click.native="delRow(scope.$index)">
          </el-button>
        </el-tooltip>
      </template>
    </el-table-column>

  </el-table>
</template>

<script>

import {getAssertMapping} from '@/apis/apiTest/api'
import {getConfigByName} from '@/apis/config/config'

export default {
  name: "validates",
  props: ['validates'],

  mounted() {
    if (this.validateTypeList.length === 0) {
      this.getAssertMappings()
    }
    if (this.dataTypeMapping.length === 0) {
      this.getDataTypeMapping()
    }
    if (this.responseDataSourceMapping.length === 0) {
      this.getResponseDataSourceMapping()
    }
  },

  created() {
    this.tempValidates = this.validates || [{data_source: null, key: null, validate_type: null, data_type: null, value: null}]
  },

  data() {
    return {
      validateTypeList: [],
      tempValidates: [{data_source: null, key: null, validate_type: null, data_type: null, value: null}],

      dataTypeMapping: [],
      responseDataSourceMapping: [],
    }
  },

  methods: {

    // 从后端获取断言方式
    getAssertMappings() {
      getAssertMapping().then(response => {
        this.validateTypeList = response.data
      })
    },

    // 从后端获取数据类型映射
    getDataTypeMapping(){
      getConfigByName({'name': 'data_type_mapping'}).then(response => {
        this.dataTypeMapping = JSON.parse(response.data.value)
      })
    },

    // 从后端获取响应数据源映射
    getResponseDataSourceMapping(){
      getConfigByName({'name': 'response_data_source_mapping'}).then(response => {
        this.responseDataSourceMapping = JSON.parse(response.data.value)
      })
    },

    // 根据选择的数据源显示不同的提示
    getDataSourcePlaceholder(_type){
      if (!_type){
        return '实际结果提取表达式'
      }else if (_type === 'regexp'){
        return '请填写正确的正则表达式'
      }else{
        return 'jsonpath表达式，若要提取整个对象，则不填写'
      }
    },

    // 选中断言类型事件
    selectValidateType(data, row){
      if (data === '值为真'){
        this.$set(row, 'data_type', 'str')
        this.$set(row, 'value', 'True')
        return true
      }else if (data === '值为假'){
        this.$set(row, 'data_type', 'str')
        this.$set(row, 'value', 'False')
        return true
      }
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
      this.tempValidates.push({data_source: null, key: null, validate_type: null, data_type: null, value: null})
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
