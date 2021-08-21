<template>

  <!-- 新增/修改配置表单 -->
  <el-dialog
    :title=" dialogStatus === 'add' ? '新增配置' : '修改配置' "
    :visible.sync="dialogIsShow"
    :close-on-click-modal="false"
    width="40%"
  >
    <el-form
      ref="dataForm"
      :model="tempConfig"
      :rules="rules"
      label-width="80px"
      style="min-width: 400px;">

      <el-form-item :label="'配置类型'" prop="type" class="is-required" size="mini">
        <configTypeSelector
          ref="configTypeSelector"
          :configTypeList="configTypeList"
          :configType="tempConfig.type"
          :dialogType="dialogStatus"
        ></configTypeSelector>
      </el-form-item>

      <el-form-item :label="'配置名'" prop="name" class="is-required" size="mini">
        <el-input v-model="tempConfig.name" :disabled="dialogStatus === 'edit'" />
      </el-form-item>

      <el-form-item :label="'配置值'" prop="value" class="is-required" size="mini">
        <el-input type="textarea" :rows="2" v-model="tempConfig.value"/>
      </el-form-item>

      <el-form-item :label="'描述'" prop="desc" size="mini">
        <el-input v-model="tempConfig.desc"/>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="dialogIsShow = false"> {{ '取消' }}</el-button>
      <el-button type="primary" size="mini" @click=" dialogStatus === 'add' ? addConfig() : changConfig() ">
        {{ '确定' }}
      </el-button>
    </div>
  </el-dialog>

</template>

<script>
import configTypeSelector from "@/components/Selector/configType";
import {postConfig, putConfig} from "@/apis/config";
import waves from '@/directive/waves'

export default {
  name: "configDialog",
  components:{configTypeSelector},
  directives: {waves},
  props: ['configTypeList'],
  data() {
    return {

      // 配置新增/编辑临时数据
      tempConfig: {
        id: '',
        name: '',
        value: '',
        type: '',
        desc: '',
      },

      // 编辑框的显示状态
      dialogIsShow: false,

      // dialog框状态，edit为编辑数据, create为新增数据
      dialogStatus: 'add',

      // 检验规则
      rules: {
        name: [{required: true, message: '请输入配置名称', trigger: 'blur'}]
      }
    }
  },

  created() {
  },

  mounted() {

    // 监听 bus 配置操作指令
    this.$bus.$on(this.$busEvents.configDialogIsShow, (status, config) => {
      if (status === 'add') {
        this.initTempConfig()
      } else if (status === 'edit') {
        this.editTempConfig(config)
      }
      this.dialogIsShow = true
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.configDialogIsShow)
  },

  methods: {
    // 点击新增配置时，初始化 dialog 数据
    initTempConfig() {
      this.dialogStatus = 'add'
      this.tempConfig.id = '';
      this.tempConfig.name = '';
      this.tempConfig.value = '';
      this.tempConfig.desc = '';
      this.tempConfig.type = '';
    },

    // 点击修改配置时，初始化 dialog 内容
    editTempConfig(config) {
      this.dialogStatus = 'edit'
      this.tempConfig.id = config.id;
      this.tempConfig.name = config.name;
      this.tempConfig.value = config.value;
      this.tempConfig.desc = config.desc;
      this.tempConfig.type = config.type;
    },

    getConfigToCommit() {
      return {
        id: this.tempConfig.id,
        name: this.tempConfig.name,
        value: this.tempConfig.value,
        desc: this.tempConfig.desc,
        type: this.$refs.configTypeSelector.tempConfigType,
      }
    },

    // 新增配置
    addConfig() {
      // this.$refs['dataForm'].validate((valid) => {
      //   if (valid) {
      //     console.log('111111: ')
      //     postConfig(this.getConfigToCommit()).then(response => {
      //       if (this.showMessage(this, response)) {
      //         this.sendIsCommitStatus()
      //       }
      //     })
      //   } else {
      //     this.$message.error('请确认规则')
      //   }
      // });
      this.$refs['dataForm'].validate((valid) => {
        postConfig(this.getConfigToCommit()).then(response => {
          if (this.showMessage(this, response)) {
            this.sendIsCommitStatus()
          }
        })
      });
    },

    // 修改配置
    changConfig() {
      // this.$refs['dataForm'].validate((valid) => {
      //   if (valid) {
      //     putConfig(this.getConfigToCommit()).then(response => {
      //       if (this.showMessage(this, response)) {
      //         this.sendIsCommitStatus()
      //       }
      //     })
      //   } else {
      //     this.$message.error('请确认规则')
      //   }
      // });
      putConfig(this.getConfigToCommit()).then(response => {
        if (this.showMessage(this, response)) {
          this.sendIsCommitStatus()
        }
      })
    },

    // 向父组件发送form表单提交状态
    sendIsCommitStatus() {
      this.dialogIsShow = false
      this.$bus.$emit(this.$busEvents.configDialogIsCommit, 'success')
    },
  },

  computed: {},

  watch: {}
}
</script>


<style scoped>

</style>
