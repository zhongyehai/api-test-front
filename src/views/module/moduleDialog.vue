<template>

  <!-- 新增/修改模块表单 -->
  <el-dialog
    :title=" dialogStatus === 'add' ? '新增模块' : '修改模块' "
    :visible.sync="dialogFormVisible"
    :close-on-click-modal="false"
    width="40%"
  >
    <el-form
      ref="dataForm"
      :model="tempModule"
      :rules="rules"
      label-position="left"
      label-width="90px"
      style="min-width: 400px;">
      <!-- 用户信息 -->
      <el-form-item :label="'模块名称'" prop="name" class="filter-item" size="mini">
        <el-input v-model="tempModule.name" placeholder="同一项目下，模块名称不可重复"/>
      </el-form-item>
      <el-form-item :label="'模块序号'" prop="num" class="filter-item" size="mini">
        <el-input v-model="tempModule.num" placeholder="数字，在当前项目下，此模块的序号，用于排序"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="dialogFormVisible = false"> {{ '取消' }}</el-button>
      <el-button type="primary" size="mini" @click=" dialogStatus === 'add' ? addModule() : changModule() ">
        {{ '确定' }}
      </el-button>
    </div>
  </el-dialog>

</template>

<script>
import {postModule, putModule} from "@/apis/module";
import waves from '@/directive/waves'

export default {
  name: "dialogForm",
  directives: {waves},
  props: [
    'currentModule',
    'currentProject'
  ],
  data() {
    return {

      // 模块新增/编辑临时数据
      tempModule: {
        id: '',
        num: '',
        name: '',
        project_id: '',
      },

      // 编辑框的显示状态
      dialogFormVisible: false,

      // dialog框状态，edit为编辑数据, create为新增数据
      dialogStatus: 'add',

      // 检验规则
      rules: {
        name: [{required: true, message: '请输入模块名称', trigger: 'blur'}],
        num: [{required: true, message: '请输入模块序号', trigger: 'blur'}]
      }
    }
  },

  created() {
  },

  mounted() {
    // 监听 bus 模块操作指令
    this.$bus.$on(this.$busEvents.moduleTreeCommand, (command) => {
      // console.log('command: ', command)
      if (command === 'add') {
        this.initTempModule()
      } else if (command === 'edit') {
        this.editTempModule()
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.moduleTreeCommand)
  },

  methods: {
    // 点击新增模块时，初始化 dialog 数据
    initTempModule() {
      this.dialogStatus = 'add'
      this.tempModule.name = '';
      this.tempModule.id = '';
      this.tempModule.num = '';
      this.tempModule.project_id = this.currentProject.id;
      this.dialogFormVisible = true
    },

    // 点击修改模块时，初始化 dialog 内容
    editTempModule() {
      this.dialogStatus = 'edit'
      this.tempModule.name = this.currentModule.name;
      this.tempModule.id = this.currentModule.id;
      this.tempModule.num = this.currentModule.num;
      this.tempModule.project_id = this.currentProject.id;
      this.dialogFormVisible = true
    },

    // 新增模块
    addModule() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          postModule(this.tempModule).then(response => {
            if (this.showMessage(this, response)) {
              this.sendIsCommitStatus()
            }
          })
        } else {
          this.$message.error('请确认规则')
        }
      });
    },

    // 修改模块
    changModule() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          putModule(this.tempModule).then(response => {
            if (this.showMessage(this, response)) {
              this.sendIsCommitStatus()
            }
          })
        } else {
          this.$message.error('请确认规则')
        }
      });
    },

    // 向父组件发送form表单提交状态
    sendIsCommitStatus() {
      this.dialogFormVisible = false
      this.$bus.$emit(this.$busEvents.moduleDialogCommit, 'success')
    },
  },

  computed: {},

  watch: {}
}
</script>


<style scoped>

</style>
