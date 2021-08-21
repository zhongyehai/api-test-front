<template>

  <el-select
    v-model="tempFuncFiles"
    multiple
    filterable
    placeholder="请选择函数文件"
    style="width:100%"
    class="filter-item">
    <el-option v-for="funcFile in funcFilesList"
               :key="funcFile.id"
               :label="funcFile.name"
               :value="funcFile.name"
    ></el-option>
  </el-select>

</template>

<script>

import {funcFileList} from '@/apis/funcFile'

export default {
  name: 'funcFile',
  props: ['funcFiles'],
  mounted() {
    this.getFuncFileList()
  },
  created() {
    this.tempFuncFiles = this.funcFiles
  },
  data() {
    return {

      // 自定义函数列表
      funcFilesList: [],

      tempFuncFiles: []

    }
  },
  methods: {

    // 获取自定义函数列表
    getFuncFileList() {
      funcFileList().then(response => {
        this.funcFilesList = response.data.data
      })
    }
  },
  watch: {
    'funcFiles': {
      handler(newVal, oldVal) {
        this.tempFuncFiles = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
