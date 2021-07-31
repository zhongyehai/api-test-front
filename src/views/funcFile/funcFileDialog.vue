<template>
  <!-- 新增/修改用例集表单 -->
  <el-dialog
    :title="'新增函数文件'"
    :visible.sync="currentDialogIsShow"
    :close-on-click-modal="false"
    width="40%"
  >
    <el-form ref="dataForm" label-position="left" label-width="100px" style="min-width: 400px;">
      <!-- 用户信息 -->
      <el-form-item :label="'函数文件名'" prop="name" class="filter-item" size="mini">
        <el-input v-model="name"/>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="currentDialogIsShow = false"> {{ '取消' }}</el-button>
      <el-button type="primary" @click="creteFuncFile()">
        {{ '确定' }}
      </el-button>
    </div>

  </el-dialog>
</template>

<script>
import {postFuncFile} from '@/apis/funcFile'

export default {
  name: "funcFileDialog",
  props: ['dialogIsShow'],
  data() {
    return {
      currentDialogIsShow: false,
      name: ''
    }
  },
  created() {
    this.currentDialogIsShow = this.dialogIsShow
  },
  methods: {
    creteFuncFile() {
      postFuncFile({'name': this.name}).then(response => {
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.addFuncFileIsCommit, 'addFuncFileIsCommit')
          this.currentDialogIsShow = false
        }
      })
    }
  },
  watch: {
    'dialogIsShow': {
      handler(newVaul, oldVal) {
        this.currentDialogIsShow = newVaul
      }
    }
  }
}
</script>

<style scoped>

</style>
