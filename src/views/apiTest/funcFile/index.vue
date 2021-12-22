<template>
  <div class="app-container">

    <!-- 函数文件table -->
    <el-row>

      <!-- 第一列，函数文件列表 -->
      <el-col :span="8">
        <funcTableView></funcTableView>
      </el-col>

      <!-- 第二列, 函数文件编辑区 -->
      <el-col :span="15" style="float: right">
        <funcEditorView></funcEditorView>
      </el-col>

    </el-row>

  </div>
</template>

<script>
import funcTableView from "@/views/apiTest/funcFile/funcTable";
import funcEditorView from "@/views/apiTest/funcFile/funcEditor";

export default {
  name: "funcFile",
  components: {
    funcTableView,
    funcEditorView
  },
  data() {
    return {
    }
  },
  methods: {
  }

}
</script>

<style scoped>

</style>
