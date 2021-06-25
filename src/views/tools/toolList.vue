<template>
  <div class="app-container">
    <div style="margin: 10px;padding-left: 10px">
      <el-button type="primary" @click.native="openFileUploadDialog(1)" size="small">文件上传</el-button>
    </div>

    <el-dialog title="上传文件" :visible.sync="fileUploadDialogIsShow" width="30%">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="文件地址">
          <el-input v-model="fileAddress" size="small" :disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-upload
            class="upload-demo"
            action="/api/upload"
            :show-file-list='false'
            :on-success="getFileAddress">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="fileUploadDialogIsShow = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {fileUpload} from "@/apis/file";

export default {
  name: 'toolList',
  data() {
    return {
      fileUploadDialogIsShow: false,
      fileAddress: ''
    }
  },

  methods: {

    openFileUploadDialog(status) {
      this.status = status;
      this.fileUploadDialogIsShow = true;
      this.fileAddress = ''
    },

    uploadToServer(form) {
      // 上传文件到服务器
      fileUpload(form).then((response) => {
          this.showMessage(this, response)
          this.fileAddress = response.data;
        }
      );
    },

    getFileAddress(response, file) {
      // 获取本地文件
      let form = new FormData();
      form.append("file", file.raw);
      if (response['status'] === 400) {
        this.$confirm('服务器已存在相同名字文件，是否覆盖?', '提示', {
          confirmButtonText: '覆盖',
          cancelButtonText: '不覆盖',
          type: 'warning'
        }).then(() => {
          form.append("skip", '1');  // 覆盖已有文件
          this.uploadToServer(form)
        }).catch(() => {
          form.append("skip", '0');  // 不覆盖已有文件
          this.uploadToServer(form)
        });
      } else {
        this.showMessage(this, response)
        this.fileAddress = response.data;
      }
    }

  },
}
</script>

<style>

.list {
  max-height: 200px;
}
</style>
