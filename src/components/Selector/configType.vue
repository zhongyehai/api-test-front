<template>
  <el-select
    v-model="tempConfigType"
    placeholder="选择配置类型"
    value-key="id"
    :disabled="dialogType === 'edit'"
    style="min-width: 100%;padding-right:10px"
    size="small"
  >
    <el-option v-for="item in configTypeList" :key="item.id" :label="item.name" :value="item.name">
    </el-option>
  </el-select>
</template>

<script>

export default {
  name: "configType",
  props: ['configTypeList', 'configType', 'dialogType'],
  data() {
    return {
      tempConfigType: '',
    }
  },
  methods: {},

  created() {
    this.tempConfigType = this.configType
  },
}
</script>

<style scoped>

</style>
