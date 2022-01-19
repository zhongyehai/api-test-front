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
        height="330px"
        :options="editorOptions"
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
      editorOptions: {
        // 设置代码编辑器的样式
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
        showPrintMargin: false //去除编辑器里的竖线
      }
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
