<template>
  <div class="app-container">
    <el-upload
      class="upload-demo"
      ref="upload"
      action="https://jsonplaceholder.typicode.com/posts/"
      :on-change="onChange"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :file-list="fileList"
      :auto-upload="false">
      <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fileList: [{
        name: 'food.jpeg',
        url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
      }, {
        name: 'food2.jpeg',
        url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
      }]
    };
  },
  methods: {
    submitUpload() {
      this.$refs.upload.submit();
    },

    handleRemove(file, fileList) {
      console.log('handleRemove.file: ', file);
      console.log('handleRemove.fileList: ', fileList);
      fileList.splice(fileList.indexOf(file), 1)
      console.log('handleRemove.fileList: ', fileList);
      console.log('this.fileList: ', this.fileList);
    },

    handlePreview(file) {
      console.log('handlePreview.file: ', file);
      // console.log('handlePreview.fileList: ', fileList);
    },

    // 选中文件事件
    onChange(file, fileList){
      // 检验文件是否已存在
      console.log('onChange.file: ', file);
      console.log('onChange.fileList: ', fileList);
      console.log('onChange.this.fileList: ', this.fileList);
      this.$confirm('服务器已存在相同名字文件，是否覆盖?', '提示', {
        confirmButtonText: '覆盖',
        cancelButtonText: '不覆盖',
        type: 'warning'
      }).then(() => {
        console.log(1111111111111)
      }).catch(() => {
        this.handleRemove(file, fileList)
      });
    }
  }
}
</script>

<style scoped>

</style>
