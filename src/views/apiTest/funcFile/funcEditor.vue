<template>

  <div>
    <el-form size="small">
      <el-row>
        <el-col :span="18">
          <el-form-item label="函数文件名" :label-width="'85px'" size="mini">
            <el-input v-model="name" ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-button
            type="primary"
            style="margin-left: 5px"
            size="mini"
            :loading="deBugButtonIsLoading"
            @click="debugFunc">调试
          </el-button>

          <el-button class="filter-item" type="primary" size="mini" @click="openFuncFileDialog()">新建</el-button>
        </el-col>
      </el-row>

      <el-row>
        <el-form-item label="调试函数" :label-width="'70px'" size="mini">
          <el-input v-model="debugFuncData" placeholder="输入格式：${func(abc,123)}">
          </el-input>
        </el-form-item>
      </el-row>

    </el-form>

    <funcFileDrawer></funcFileDrawer>

    <el-container>

      <editor
        :style="{'min-height': funcFileEditHeight, 'font-size': '15px'}"
        v-model="funcData"
        @init="editorInit"
        lang="python"
        theme="monokai"
        width="90%"
        :options="{enableSnippets:true, enableBasicAutocompletion: true, enableLiveAutocompletion: true}"
      >
      </editor>
      <el-button
        type="primary"
        size="mini"
        :loading="saveButtonIsLoading"
        @click.native="editFuncFile(funcData)">
        保存
      </el-button>
    </el-container>
  </div>

</template>

<script>
import funcFileDrawer from "@/views/apiTest/funcFile/drawer";
import {putFuncFile, debugFuncFile} from "@/apis/funcFile";

export default {
  name: "funcEditor",
  components: {
    funcFileDrawer,
    editor: require('vue2-ace-editor'),
  },
  data() {
    return {
      deBugButtonIsLoading: false,
      saveButtonIsLoading: false,
      funcData: '',
      name: '',
      id: '',
      debugFuncData: '',
    }
  },
  methods: {

    openFuncFileDialog() {
      this.$bus.$emit(this.$busEvents.addFuncFileDialogIsShow, true)
    },

    // 提交修改函数文件
    editFuncFile() {
      this.saveButtonIsLoading = true
      putFuncFile({'id': this.id, 'func_data': this.funcData, 'name': this.name}).then(response => {
        this.saveButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.editFuncFileIsCommit, 'success')
        }
      })
    },

    // 调试函数文件
    debugFunc() {
      this.deBugButtonIsLoading = true
      debugFuncFile({'id': this.id, 'debug_data': this.debugFuncData}).then(response => {
        this.deBugButtonIsLoading = false
        this.$alert(response.result, response.message, {confirmButtonText: '确定'});
      })
    },

    editorInit() {
      require('brace/ext/language_tools');
      require('brace/mode/python');
      require('brace/theme/monokai');
      require('brace/snippets/python')
    },
  },

  computed: {
    // 实时获 取屏幕高度-150px 作为函数文件代码编辑器的高度
    funcFileEditHeight() {
      return `${window.innerHeight - 100}px`
    }
  },

  mounted() {

    // 点击编辑函数文件事件
    this.$bus.$on(this.$busEvents.editFuncFile, (funcFile) => {
      this.funcData = funcFile.func_data
      this.name = funcFile.name
      this.id = funcFile.id
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.editFuncFile)
  },

}
</script>

<style scoped>

</style>
