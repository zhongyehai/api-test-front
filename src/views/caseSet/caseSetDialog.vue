<template>

  <!-- 新增/修改用例集表单 -->
  <el-dialog
    :title=" dialogStatus === 'add' ? '新增用例集' : '修改用例集' "
    :visible.sync="dialogFormVisible"
    :close-on-click-modal="false"
    width="40%"
  >
    <el-form
      ref="dataForm"
      :model="tempCaseSet"
      label-position="left"
      label-width="70px"
      style="min-width: 400px;"
      :rules="rules"
    >
      <!-- 用户信息 -->
      <el-form-item :label="'名称'" prop="name" class="filter-item" size="mini">
        <el-input v-model="tempCaseSet.name" placeholder="同一项目下，用例集名称不可重复"/>
      </el-form-item>
      <el-form-item :label="'序号'" prop="name" class="filter-item" size="mini">
        <el-input v-model="tempCaseSet.num" placeholder="数字，在当前项目下，此用例集的序号，用于排序"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="dialogFormVisible = false"> {{ '取消' }}</el-button>
      <el-button type="primary" size="mini" @click=" dialogStatus === 'add' ? addCaseSet() : changCaseSet() ">
        {{ '确定' }}
      </el-button>
    </div>
  </el-dialog>

</template>

<script>
import { postCaseSet, putCaseSet } from '@/apis/caseSet'
import waves from '@/directive/waves' // waves directive

export default {
  name: 'caseSetDialog',
  directives: { waves },
  props: [
    'currentProject',
    'currentCaseSet'
  ],
  data() {
    return {

      // 用例集新增/编辑临时数据
      tempCaseSet: {
        id: '',
        num: '',
        name: '',
        project_id: ''
      },

      // 编辑框的显示状态
      dialogFormVisible: false,

      // dialog框状态，edit为编辑数据, create为新增数据
      dialogStatus: 'add',

      // 检验规则
      rules: {
        name: [{ required: true, message: '请输入用例集名称', trigger: 'blur' }],
        num: [{ required: true, message: '请输入用例集序号', trigger: 'blur' }]
      }
    }
  },

  created() {
  },
  mounted() {
    // 监听 bus 用例集操作指令
    this.$bus.$on(this.$busEvents.caseSetCommand, (command) => {
      if (command === 'add') {
        this.initTempCaseSet()
      } else if (command === 'edit') {
        this.editTempCaseSet()
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.caseSetCommand)
  },

  methods: {

    // 点击新增用例集时，初始化 dialog 数据
    initTempCaseSet() {
      this.dialogStatus = 'add'
      this.tempCaseSet.name = ''
      this.tempCaseSet.id = ''
      this.tempCaseSet.num = ''
      this.tempCaseSet.project_id = this.currentProject.id
      this.dialogFormVisible = true
    },

    // 点击修改用例集时，初始化 dialog 内容
    editTempCaseSet() {
      this.dialogStatus = 'edit'
      this.tempCaseSet.name = this.currentCaseSet.name
      this.tempCaseSet.id = this.currentCaseSet.id
      this.tempCaseSet.num = this.currentCaseSet.num
      this.tempCaseSet.project_id = this.currentProject.id
      this.dialogFormVisible = true
    },

    // 新增用例集
    addCaseSet() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          postCaseSet(this.tempCaseSet).then(response => {
            if (this.showMessage(this, response)) {
              this.sendIsCommitStatus()
            }
          })
        } else {
          this.$message.error('请确认规则')
        }
      })
    },

    // 修改用例集
    changCaseSet() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          putCaseSet(this.tempCaseSet).then(response => {
            if (this.showMessage(this, response)) {
              this.sendIsCommitStatus()
            }
          })
        } else {
          this.$message.error('请确认规则')
        }
      })
    },

    // 向父组件发送form表单提交状态
    sendIsCommitStatus() {
      this.dialogFormVisible = false
      this.$bus.$emit(this.$busEvents.caseSetDialogCommit, 'success')
    }

  },
  computed: {},

  watch: {}
}
</script>


<style scoped>

</style>
