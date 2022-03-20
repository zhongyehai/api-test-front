<template>
  <!-- 新增/修改函数文件表单 -->
  <el-drawer
    :title="'新增函数文件'"
    size="40%"
    :wrapperClosable="false"
    :visible.sync="funcFileDrawerIsShow"
    :direction="direction">
    <el-form
      ref="dataForm"
      label-position="left"
      label-width="100px"
      style="min-width: 400px;;margin-left: 20px;margin-right: 20px">
      <!-- 函数文件名 -->
      <el-form-item :label="'函数文件名'" prop="name" class="is-required" size="mini">
        <el-input v-model="name"/>
      </el-form-item>
    </el-form>

    <div class="demo-drawer__footer">
      <el-button size="mini" @click="funcFileDrawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="creteFuncFile()">
        {{ '保存' }}
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import {postFuncFile} from '@/apis/apiTest/funcFile'

export default {
  name: "drawer",
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      funcFileDrawerIsShow: false,
      name: ''
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.addFuncFileDialogIsShow, (status) => {
      this.name = ''
      this.funcFileDrawerIsShow = true
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
          this.funcFileDrawerIsShow = false
        }
      })
    }
  },
}
</script>

<style scoped>

</style>
