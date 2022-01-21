<template>
  <div class="app-container">

    <el-form label-width="120px">
      <el-form-item :label="'选择文件类型：'" size="mini">
        <el-select
          v-model="fileType"
          placeholder="请选择文件类型"
          size="mini"
          @change="selectType"
        >
          <el-option
            v-for="item in fileTypeList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>

        <el-tooltip class="item" effect="dark" content="可覆盖已存在的文件" placement="right-end" style="margin-left: 20px">
          <el-button type="primary" @click.native="openFileUploadDialog" size="mini">上传文件</el-button>
        </el-tooltip>

      </el-form-item>
    </el-form>

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

      <el-table-column :show-overflow-tooltip=true prop="name" label="文件名" min-width="40%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="size" label="文件大小" min-width="10%">
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

      <el-table-column label="操作" min-width="10%">
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            content="下载报告"
            placement="top-start">
            <el-button
              type="text"
              icon="el-icon-download"
              :loading="scope.row.downloadLoadingIsShow"
              @click.native="downloadFile(scope.row)"></el-button>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="查看报告"
            placement="top-start">
            <el-button
              type="text"
              style="color: red"
              icon="el-icon-delete"
              :loading="scope.row.deleteLoadingIsShow"
              @click.native="confirmBox(delFile, scope.row, scope.row.name)"></el-button>
          </el-tooltip>
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

      // 文件列类型
      fileType: 'case',

      // 文件类型列表
      fileTypeList: [
        {'key': 'case', 'value': '用例文件'},
        {'key': 'cfca', 'value': 'CFCA证书文件'},
        {'key': 'callBack', 'value': '回调文件'},
        {'key': 'temp', 'value': '临时文件'}
      ],

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
      fileList({'pageNum': this.PageNum, 'pageSize': this.PageSize, 'fileType': this.fileType}).then(response => {
        this.fileList = response.data.data
        this.total = response.data.total
      })
    },

    // 选中事件
    selectType(value) {
      this.PageNum = 1
      this.PageSize = 20
      this.getFileList()
    },

    // 下载文件
    downloadFile(row) {
      this.$set(row, 'downloadLoadingIsShow', true)
      fileDownload({'name': row.name, 'fileType': this.fileType}).then(response => {
        this.$set(row, 'downloadLoadingIsShow', false)
        let blob = new Blob([response], {
          type: 'application/vnd.ms-excel'      //将会被放入到blob中的数组内容的MIME类型
        });
        // 保存文件到本地
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob);  //生成一个url
        a.download = row.name
        a.click()
      })
    },

    // 删除文件
    delFile(row) {
      this.$set(row, 'deleteLoadingIsShow', true)
      fileDelete({'name': row.name, 'fileType': this.fileType}).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getFileList()
        }
      })
    },

    // 打开文件上传窗口
    openFileUploadDialog() {
      this.$bus.$emit(this.$busEvents.uploadFileDialogIsShow, this.fileType)
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
  }
}
</script>

<style>

.list {
  max-height: 200px;
}
</style>
