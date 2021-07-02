<template>
  <div class="app-container">

    <div style="margin: 10px;padding-left: 10px">
      <el-tooltip class="item" effect="dark" content="可覆盖已存在的文件" placement="right-end">
        <el-button type="primary" @click.native="openFileUploadDialog" size="small">上传文件</el-button>
      </el-tooltip>
    </div>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="fileList"
      stripe
    >
      <el-table-column prop="id" label="编号" min-width="5%">
        <template slot-scope="scope">
          <span> {{ scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="文件名" min-width="30%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="size" label="文件文件大小" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.size }} 字节</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="lastVisitTime" label="最近一次使用时间" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.lastVisitTime }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="LastModifiedTime" label="最后一次更新时间" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.LastModifiedTime }} </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="20%">
        <template slot-scope="scope">

          <el-button type="primary"
                     size="mini"
                     @click.native="downloadFile(scope.row.name)">下载
          </el-button>

          <el-button type="danger"
                     size="mini"
                     @click.native="confirmBox(delFile, scope.row.name, scope.row.name)">删除
          </el-button>

        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="PageNum"
      :limit.sync="PageSize"
      @pagination="getFileList"
    />

    <uploadFileView></uploadFileView>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import uploadFileView from "@/components/file/uploadFile";
import {fileList, fileDelete, fileDownload} from "@/apis/file";

export default {
  name: 'fileManage',
  components: {Pagination, uploadFileView},
  data() {
    return {
      // 加载状态
      listLoading: false,

      // 文件列表
      fileList: [],

      total: 0,
      PageNum: 1,
      PageSize: 20
    }
  },

  methods: {

    // 获取文件列表
    getFileList() {
      fileList({'pageNum': this.PageNum, 'pageSize': this.PageSize}).then(response => {
        this.fileList = response.data.data
        this.total = response.data.total
      })
    },

    // 下载文件
    downloadFile(fileName) {
      fileDownload({'name': fileName}).then(response => {
        let blob = new Blob([response], {
          type: 'application/vnd.ms-excel'      //将会被放入到blob中的数组内容的MIME类型
        });
        let objectUrl = URL.createObjectURL(blob);  //生成一个url
        this.download(objectUrl, fileName)
      })
    },

    // 保存文件到本地
    download(content, filename) {
      let a = document.createElement('a')
      a.href = content
      a.download = filename
      a.click()
    },

    // 删除文件
    delFile(fileName) {
      fileDelete({'name': fileName}).then(response => {
        if (this.showMessage(this, response)) {
          this.getFileList()
        }
      })
    },

    // 打开文件上传窗口
    openFileUploadDialog() {
      this.$bus.$emit(this.$busEvents.uploadFileDialogIsShow, true)
    }
  },

  mounted() {

    // 监听 Dialog 打开事件
    this.$bus.$on(this.$busEvents.uploadFileIsCommit, (status) => {
      this.getFileList()
    })

    this.getFileList()
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.uploadFileIsCommit)
  },
}
</script>

<style>

.list {
  max-height: 200px;
}
</style>
