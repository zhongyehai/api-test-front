<template>
  <div style="border:1px solid rgb(234, 234, 234) ">
    <el-container>
      <editor
        style="font-size: 15px"
        v-model="tempDataJson"
        @init="initJsonEditor"
        lang="json"
        theme="chrome"
        width="100%"
        height="515px"
        :options="{}"
      >
      </editor>
    </el-container>
  </div>

</template>

<script>

export default {
  name: "dataJson",
  components: {
    editor: require('vue2-ace-editor'),
  },
  props: ['dataJson'],
  data() {
    return {
      tempDataJson: '',
    }
  },

  created() {
    this.tempDataJson = this.dataJson
  },

  methods: {
    // 初始化 json 编辑器
    initJsonEditor() {
      require('brace/ext/language_tools');
      require('brace/mode/json');
      require('brace/theme/chrome');
      require('brace/snippets/json')
    },
  },
  watch: {
    'dataJson': {
      handler(newVal, oldVal) {
        this.tempDataJson = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
