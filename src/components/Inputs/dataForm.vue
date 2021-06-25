<template>

  <el-table
    :data="tempDataForm"
    size="mini"
    stripe
    :show-header="false"
    style="background-color: rgb(250, 250, 250)"
    :row-style="{'background-color': 'rgb(250, 250, 250)'}">

    <el-table-column label="Key" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.key" size="mini" placeholder="key">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="type" header-align="center" min-width="25%">
      <template slot-scope="scope">
        <el-select v-model="scope.row.data_type" size="mini" placeholder="选择数据类型">
          <el-option v-for="item in formDataTypes" :key="item" :value="item">
          </el-option>
        </el-select>
      </template>
    </el-table-column>

    <el-table-column label="Value" header-align="center" mmin-width="10%">
      <template slot-scope="scope">

        <!-- 文件 -->
        <div v-if="scope.row.data_type === 'file'">
          <el-row>
            <el-col :span="18">
              <el-input v-model="scope.row.value" size="mini" :disabled="true" placeholder="请上传文件">
              </el-input>
            </el-col>
            <el-col :span="2" style="padding-left:10px;">
              <el-upload
                class="upload-demo"
                action="/api/upload"
                :show-file-list='false'
                :on-success="uploadFile">
                <el-button size="mini" type="primary" @click="changPageFileName(scope.$index)">点击上传</el-button>
              </el-upload>
            </el-col>
          </el-row>
        </div>

        <!-- 文本 -->
        <div v-else>
          <el-input v-model="scope.row.value" placeholder="value"
                    :id="'data_input' + scope.$index "
                    type="textarea"
                    rows=1
                    size="mini"
                    resize="none">
          </el-input>
        </div>

      </template>

    </el-table-column>
    <el-table-column label="备注" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.remark" size="mini" placeholder="备注">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="添加" header-align="center" min-width="12%">
      <template slot-scope="scope">
        <el-button v-show="isShowAddButton(scope.$index)"
                   type="primary"
                   size="mini"
                   @click.native="addRow(scope.$index)">+
        </el-button>
      </template>
    </el-table-column>
    <el-table-column label="删除" header-align="center" min-width="12%">
      <template slot-scope="scope">
        <el-button v-show="isShowDelButton(scope.$index)"
                   type="danger"
                   size="mini"
                   @click.native="delRow(scope.$index)">-
        </el-button>
      </template>
    </el-table-column>

  </el-table>
</template>

<script>
import {fileUpload} from "@/apis/file";

export default {
  name: "dataForm",
  props: ['dataForm'],
  data() {
    return {
      // form-data的类型，文本还是文件
      formDataTypes: ['string', 'file'],
      tempDataForm: ''
    }
  },

  methods: {

    // 上传文件到服务器
    uploadFileToServer(form) {
      fileUpload(form).then((response) => {
          if (this.showMessage(this, response)) {
            this.tempDataForm[this.currentTempApiDataFormIndex]['value'] = response['data']  // 修改页面上的文件名
          }
        }
      )
    },

    // 上传文件
    uploadFile(response, file) {
      // 响应文件已存在
      if (response.message.indexOf('文件已存在') !== -1) {
        let form = new FormData();
        form.append("file", file.raw);
        this.$confirm(
          '服务器已存在相同名字文件，是否覆盖?',
          '提示',
          {
            confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
          }).then(() => {
          form.append("skip", '1');  // 覆盖已有文件
          this.uploadFileToServer(form)
        }).catch(() => {
          form.append("skip", '0');  // 不覆盖已有文件
          this.uploadFileToServer(form)
        });
      } else {
        this.showMessage(this, response)
        this.tempDataForm[this.currentTempApiDataFormIndex]['value'] = response['data']  // 修改页面上的文件名
      }
    },

    // 获取当前上传文件的数据的索引
    changPageFileName(index) {
      this.currentTempApiDataFormIndex = index;
    },

    // 是否显示添加按钮
    isShowAddButton(index) {
      return index === this.tempDataForm.length - 1
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempDataForm.length === 1 && index === 0)
    },

    // 添加一行
    addRow() {
      this.tempDataForm.push({key: null, value: null, remark: null})
    },

    // 删除一行
    delRow(index) {
      this.tempDataForm.splice(index, 1);
    },
  },

  created() {
    this.tempDataForm = this.dataForm
  },

  watch: {

    'dataForm': {
      handler(newVal, oldVal) {
        this.tempDataForm = newVal
      }
    },
  }
}
</script>

<style scoped>

</style>
