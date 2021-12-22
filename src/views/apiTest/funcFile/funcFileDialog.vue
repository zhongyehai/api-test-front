<template>
  <!-- 新增/修改用例集表单 -->
  <el-dialog
    :title="'新增函数文件'"
    :visible.sync="currentDialogIsShow"
    :close-on-click-modal="false"
    width="40%"
  >
    <el-form ref="dataForm" label-position="left" label-width="100px" style="min-width: 400px;">
      <!-- 函数文件名 -->
      <el-form-item :label="'函数文件名'" prop="name" class="is-required" size="mini">
        <el-input v-model="name"/>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="currentDialogIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="creteFuncFile()">
        {{ '确定' }}
      </el-button>
    </div>

  </el-dialog>
</template>

<script>
import {postFuncFile} from '@/apis/funcFile'

export default {
  name: "funcFileDialog",
  data() {
    return {
      submitButtonIsLoading: false,
      currentDialogIsShow: false,
      name: ''
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.addFuncFileDialogIsShow, (status) => {
      this.name = ''
      this.currentDialogIsShow = true
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.addFuncFileDialogIsShow)
  },

  methods: {
    creteFuncFile() {
      this.submitButtonIsLoading = true
      postFuncFile({'name': this.name}).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.addFuncFileIsCommit, 'addFuncFileIsCommit')
          this.currentDialogIsShow = false
        }
      })
    }
  },
}
</script>

<style scoped>

</style>
