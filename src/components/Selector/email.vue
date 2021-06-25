<template>
  <el-select
    v-model="tempEmailServer"
    placeholder="选择邮箱"
    value-key="id"
    style="min-width: 100%;padding-right:10px"
    size="small"
  >
    <el-option v-for="item in configEmailServerList" :key="item.id" :label="item.name" :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
import {configList} from "@/apis/config";

export default {
  name: "email",
  props: ['oldEmailServer'],
  data() {
    return {
      tempEmailServer: '',
      configEmailServerList: ''
    }
  },
  methods: {
    // 获取配置中的所有邮箱地址
    getConfigEmailList() {
      configList({'type': '邮箱'}).then(response => {
        this.configEmailServerList = response.data.data
      })
    },
  },

  mounted() {
    this.getConfigEmailList()
  },

  created() {
    this.tempEmailServer = this.oldEmailServer
  },
}
</script>

<style scoped>

</style>
