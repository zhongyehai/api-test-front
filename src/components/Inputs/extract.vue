<template>
  <el-table :data="tempData" stripe :show-header="false" size="mini">

    <el-table-column label="Key" header-align="center" min-width="35%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.key" size="mini" type="textarea" :rows="1" :placeholder="placeholderKey">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="数据源" header-align="center" min-width="20%">
      <template slot-scope="scope">
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
      </template>
    </el-table-column>

    <el-table-column label="Value" header-align="center" min-width="35%">
      <template slot-scope="scope">
        <el-input
          v-model="scope.row.value"
          size="mini"
          type="textarea"
          :rows="1"
          :placeholder="getPlaceholder(scope.row.data_source)">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="备注" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.remark" size="mini" type="textarea" :rows="1" :placeholder="placeholderDesc">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="添加" header-align="center" min-width="5%">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
          <el-button
            v-show="isShowAddButton( scope.$index)"
            type="text"
            size="mini"
            icon="el-icon-plus"
            @click.native="addRow(scope.$index)"
          >
          </el-button>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column label="删除" header-align="center" min-width="5%">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
          <el-button
            v-show="isShowDelButton(scope.$index)"
            type="text"
            size="mini"
            icon="el-icon-minus"
            style="color: red"
            @click.native="delRow(scope.$index)"
          >
          </el-button>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import {getConfigByName} from "@/apis/config/config";

export default {
  name: 'extract',
  props: [
    'currentData',
    'placeholderKey',
    'placeholderValue',
    'placeholderDesc'
  ],
  data() {
    return {
      tempData: [],
      responseDataSourceMapping: []
    }
  },
  methods: {

    // 从后端获取响应数据源映射
    getResponseDataSourceMapping(){
      getConfigByName({'name': 'response_data_source_mapping'}).then(response => {
        this.responseDataSourceMapping = JSON.parse(response.data.value)
      })
    },

    // 根据选择的数据源显示不同的提示
    getPlaceholder(_type){
      if (!_type){
        return this.placeholderValue
      }else if (_type === 'regexp'){
        return '请填写正确的正则表达式'
      }else{
        return 'jsonpath表达式，若要提取整个对象，则不填写'
      }
    },

    // 是否显示添加按钮
    isShowAddButton(index) {
      return index === this.tempData.length - 1
    },

    // 添加一行
    addRow() {
      this.tempData.push({key: null, data_source: null, value: null, remark: null})
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
    this.getResponseDataSourceMapping()
    this.tempData = this.currentData
  },
  watch: {
    'currentData': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.tempData = newVal
        } else {
          this.tempData = [{key: null, data_source: null, value: null, remark: null}]
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
