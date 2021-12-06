<template>
  <div class="app-container">

    <el-form label-width="120px">
      <el-form-item :label="'选择项目：'" size="mini">
        <el-select
          v-model="currentProject"
          placeholder="请选择项目"
          size="mini"
          @change="getKYMByProject"
        >
          <el-option
            v-for="item in projectList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>

        <el-button type="primary" @click.native="showDialog()" size="mini" style="margin-left: 20px">添加KYM分析
        </el-button>

      </el-form-item>
    </el-form>


    <el-collapse v-model="activeNames">
      <el-collapse-item :name="index" v-for="(value, key, index) in currentKYM" :key="key">
        <template slot="title">
          <div class="el-collapse-item-title"> {{ key }}</div>
        </template>

        <el-table :data="value" border fit highlight-current-row style="width: 100%">
          <el-table-column prop="id" label="序号" min-width="5%">
            <template slot-scope="scope">
              <span> {{ scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true label="分析项" min-width="30%">
            <template slot-scope="scope">
              <span> {{ scope.row.key }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true label="分析值" min-width="55%">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.value"
                class="edit-input"
                :disabled="!scope.row.enabled"
                autosize
                placeholder="请完善"
                type="textarea"
                size="mini"/>
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="10%">
            <template slot-scope="scope">

              <el-button
                type="primary"
                size="mini"
                v-show="!scope.row.enabled"
                @click.native="clickChangeButton(scope.row)"
              >修改
              </el-button>

              <el-button
                type="primary"
                size="mini"
                :loading="scope.row.isLoading"
                v-show="scope.row.enabled"
                @click.native="changeKYM(scope.row, key, scope.$index)"
              >提交
              </el-button>

            </template>
          </el-table-column>
        </el-table>

      </el-collapse-item>
    </el-collapse>


    <!-- 新增KYM分析 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="'新增KYM分析'"
      :visible.sync="dialogIsShow"
      width="40%">
      <el-form
        ref="dataForm"
        label-position="right"
        label-width="90px"
        style="min-width: 400px;">
        <el-form-item :label="'项目名'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="formProject" placeholder="项目名称"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click=" addKYMProject() ">
          {{ '确定' }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {getProjectKYM, putProjectKYM, addKYM, KYMProjectList} from "@/apis/tools";

export default {
  name: 'kymAnalysis',
  data() {
    return {

      // 项目列表
      projectList: [],

      // 默认展开的项
      activeNames: [],

      // 下拉框选中的项目
      currentProject: '',

      // form表单的项目名
      formProject: '',

      // 当前项目的KYM，用于渲染页面
      currentKYM: {},

      // 当前项目的KYM的复制体，用于提交
      currentKYMCopy: {},

      submitButtonIsLoading: false,

      // Dialog状态
      dialogIsShow: false
    }
  },

  methods: {

    // 点击修改按钮，启用编辑
    clickChangeButton(row) {
      this.$set(row, 'enabled', true)
    },

    // 新增项目
    addKYMProject() {
      this.submitButtonIsLoading = true
      addKYM({project: this.formProject}).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.dialogIsShow = false
          this.getKYMProjectList()
        }
      })
    },

    // 获取项目列表
    getKYMProjectList() {
      KYMProjectList().then(response => {
        this.projectList = response.data
      })
    },

    // 获取指定项目的KYM
    getKYMByProject(value) {
      getProjectKYM({project: value}).then(response => {
        this.currentKYM = response.data.kym
        this.currentKYMCopy = JSON.parse(JSON.stringify(response.data.kym))

        // 遍历项数，用于默认展开所有项
        for (let i in Object.keys(this.currentKYM)){
          this.activeNames.push(Number(i))
        }
      })
    },

    // 提交修改KYM
    changeKYM(row, key, index) {
      this.$set(row, 'isLoading', true)
      this.currentKYMCopy[key][index].value = row.value
      putProjectKYM({project: this.currentProject, kym: this.currentKYMCopy}).then(response => {
        this.$set(row, 'isLoading', false)
        if (this.showMessage(this, response)) {
          this.$set(row, 'enabled', false)
        }
      })
    },

    // 打开 dialog
    showDialog() {
      this.formProject = ''
      this.dialogIsShow = true
    }
  },

  mounted() {
    this.getKYMProjectList()
  },
}
</script>

<style>
.el-collapse-item-title {
  font-weight: 600;
  font-size: 15px;
  margin-left: 10px;
  color: #409eff
}
</style>
