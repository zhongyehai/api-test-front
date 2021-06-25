<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">

      <el-tab-pane label="配置类型管理" name="type">
        <configType></configType>
      </el-tab-pane>

      <el-tab-pane label="全局参数设置" name="config">
        <config></config>
      </el-tab-pane>

    </el-tabs>

  </div>

</template>

<script>

import configType from "@/views/configs/configType";

import config from "@/views/configs/config";

export default {
  name: "index",
  components: {
    configType,
    config
  },
  data() {
    return {
      activeName: 'config'
    };
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    }
  }
}
</script>

<style scoped>

</style>
