<template>
  <el-select
    v-model="current_environment"
    clearable
    filterable
    placeholder="请选择运行环境"
    size="small"
    style="min-width: 20%;padding-right:10px"
  >
    <el-option v-for="(item) in environments"
               :key="item.key"
               :label="item.value"
               :value="item.key"
    >
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "environment",
  props:['choice_environment'],
  data() {
    return {
      current_environment: 'test',
      environments: [
        {'key': 'dev', 'value': '开发环境'},
        {'key': 'test', 'value': '测试环境'},
        {'key': 'uat', 'value': 'uat环境'},
        {'key': 'production', 'value': '生产环境'},
      ]

    }
  },

  methods: {},

  created() {
    this.current_environment = this.choice_environment ? this.choice_environment : 'test'
  },

  watch: {
    // 实时更新接口选择的环境
    'choice_environment': {
      handler(newVal, oldVal) {
        this.current_environment = newVal ? this.choice_environment : 'test'
      }
    },
  }
}
</script>

<style scoped>

</style>

