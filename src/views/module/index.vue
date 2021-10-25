<template>

  <div class="app-container">

    <el-row>

      <!-- 第一列项目树 -->
      <el-col style="width: 20%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <el-tabs v-model="projectTab" class="table_padding table_project">
          <el-tab-pane :label="projectTab" :name="projectTab">
            <div class="custom-tree-container">
              <div class="block">
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" size="mini"></el-input>
                <el-tree
                  ref="tree"
                  :check-on-click-node="false"
                  :data="dataList"
                  :default-expanded-keys="[defaultModule]"
                  :empty-text="'请先创建项目'"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  :highlight-current="true"
                  lazy
                  node-key="id"
                  @node-click="getModuleList"
                  @node-drag-end="nodeDragEnd">
          <span slot-scope="{ node, data }"
                class="custom-tree-node"
                @mouseenter="mouseenter(data)"
                @mouseleave="mouseleave(data)">
            <span>{{ data.name }}</span>
            <span v-show="data.showMenu">
              <el-tooltip :content="node.level !== 1 ? '为当前模块添加子模块' : '为当前项目添加模块'"
                          class="item"
                          effect="dark"
                          placement="top-start">
                <el-button icon="el-icon-plus"
                           size="mini"
                           type="text"
                           @click.stop="showModuleDialog('add', node, data)"
                ></el-button>
              </el-tooltip>

              <el-tooltip class="item" content="修改当前模块名" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           icon="el-icon-edit"
                           size="mini"
                           type="text"
                           @click.stop="showModuleDialog('edit', node, data)"
                ></el-button>
              </el-tooltip>

              <el-tooltip class="item" content="删除当前模块" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           icon="el-icon-delete"
                           size="mini"
                           type="text"
                           @click.stop="clickDeleteChild(node, data)"
                ></el-button>
              </el-tooltip>

              <el-tooltip class="item" content="为当前模块添加单条接口" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           icon="el-icon-share"
                           size="mini"
                           type="text"
                           @click.stop="addApi(node, data)"
                ></el-button>
              </el-tooltip>

              <el-tooltip class="item" content="从表格中导入接口" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           icon="el-icon-upload2"
                           size="mini"
                           type="text"
                           @click.stop="showUploadFileDialog(node, data)"
                ></el-button>
              </el-tooltip>
                    </span>
                  </span>
                </el-tree>
              </div>

            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <!-- 第二列，接口列表 -->
      <el-col style="width: 79%; margin-left: 5px">
        <!-- 接口管理组件 -->
        <apiManage
          :currentModuleId="temp_module_id"
          :currentProject="currentProject"
        ></apiManage>
      </el-col>

    </el-row>

    <el-dialog :close-on-click-modal="false" :title="'上传接口文件'" :visible.sync="uploadFileDialogIsShow"
               width="40%">
      <el-row>

        <el-col :span="12">
          <el-upload
            class="upload-demo"
            :action="uploadApiMsg"
            :show-file-list='false'
            :on-success="uploadFile">
            <el-button size="mini" type="primary">选择文件</el-button>
          </el-upload>
        </el-col>

        <el-col :span="12">
          <el-button size="mini" type="primary" style="float: right" @click="downloadTemplate">下载模板</el-button>
        </el-col>

      </el-row>


      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="uploadFileDialogIsShow = false">关闭</el-button>
      </div>

    </el-dialog>

    <!-- 新增/修改模块表单 -->
    <el-dialog
      :close-on-click-modal="false"
      :title=" dialogStatus === 'add' ? '新增模块' : '修改模块' "
      :visible.sync="dialogFormVisible"
      width="40%">
      <el-form
        ref="dataForm"
        :model="tempDataForm"
        :rules="rules"
        label-position="left"
        label-width="90px"
        style="min-width: 400px;">
        <el-form-item :label="'模块名称'" class="filter-item" prop="name" size="mini">
          <el-input v-model="tempDataForm.name" placeholder="同一节点下，模块名称不可重复"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false"> {{ '取消' }}</el-button>
        <el-button size="mini" type="primary" @click=" dialogStatus === 'add' ? addModule() : changModule() ">
          {{ '确定' }}
        </el-button>
      </div>
    </el-dialog>

  </div>


</template>

<script>
import apiManage from '@/views/api'  // 接口管理组件
import waves from "@/directive/waves";
import {projectList} from "@/apis/project";
import {moduleTree, deleteModule, postModule, putModule} from "@/apis/module";
import {downloadApiMsgTemplate, uploadApi, uploadApiMsg} from "@/apis/api";


export default {
  name: 'index',
  components: {
    apiManage
  },
  directives: {waves},
  data() {
    return {
      // 查询关键字
      filterText: '',

      projectTab: '项目和模块',

      defaultModule: {},
      dataList: [],
      temp_node: {},
      temp_module_id: {},
      dialog_temp_node: {},
      dialog_temp_data: {},
      dialogFormVisible: false,
      dialogStatus: '',
      tempProjectList: [],
      currentProject: {},
      tempDataForm: {
        name: '',
        id: '',
        num: '',
        level: '',
        parent: '',
        project_id: '',
      },

      // 文件上传框打开状态
      uploadApiMsg: uploadApiMsg,
      uploadFileDialogIsShow: false,
      fileDataList: [],


      // 检验规则
      rules: {
        name: [{required: true, message: '请输入模块名称', trigger: 'blur'}]
      },
    }
  },

  created() {
    this.getProjectList()
  },

  methods: {

    // 鼠标滑入的时候，设置一个值，代表展示菜单
    mouseenter(data) {
      this.$set(data, 'showMenu', true);
    },

    // 鼠标滑出的时候，把可展示菜单的标识去掉
    mouseleave(data) {
      this.$set(data, 'showMenu', false);
    },

    // 模块编辑框
    showModuleDialog(command, node, data) {
      this.dialog_temp_node = node
      this.dialog_temp_data = data
      this.dialogStatus = command
      this.tempDataForm.name = command === 'edit' ? this.dialog_temp_data.name : ''
      this.dialogFormVisible = true
    },

    // 添加模块
    addModule() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          postModule({
            name: this.tempDataForm.name,
            id: '',
            num: '',
            level: this.dialog_temp_node.level + 1,
            parent: this.dialog_temp_node.level === 1 ? null : this.dialog_temp_node.data.id,
            // node为第一级，则说明是项目级，直接取id，非第一级，则取当前node的project_id
            project_id: this.dialog_temp_node.level === 1 ? this.dialog_temp_node.data.id : this.dialog_temp_node.data.project_id,
          }).then(response => {
            if (this.showMessage(this, response)) {
              this.dialogFormVisible = false
              this.currentProject = this.getCurrentProject(this.dialog_temp_node.level === 1 ? this.dialog_temp_data.id : this.dialog_temp_data.project_id)

              // 把当前添加的节点加入到父节点下
              if (!this.dialog_temp_data.children) {
                this.$set(this.dialog_temp_data, 'children', [])
              }
              this.dialog_temp_data.children.push(response.data)
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
          putModule({
            name: this.tempDataForm.name,
            id: this.dialog_temp_data.id,
            num: this.dialog_temp_data.num,
            level: this.dialog_temp_data.level,
            parent: this.dialog_temp_data.parent,
            project_id: this.dialog_temp_data.project_id,
          }).then(response => {
            if (this.showMessage(this, response)) {
              this.dialogFormVisible = false
              this.dialog_temp_data.name = response.data.name
            }
          })
        } else {
          this.$message.error('请确认规则')
        }
      });
    },

    // 递归把列表转为树行结构
    arrayToTree(arr, parentId) {
      //  arr 是返回的数据  parendId 父id
      let temp = [];
      let treeArr = arr;
      treeArr.forEach((item, index) => {
        if (item.parent == parentId) {
          if (this.arrayToTree(treeArr, treeArr[index].id).length > 0) {
            // 递归调用此函数
            treeArr[index].children = this.arrayToTree(treeArr, treeArr[index].id);
          }
          temp.push(treeArr[index]);
        }
      });
      return temp;
    },

    // 点击树的时候，获取到对应节点的数据
    getModuleList(data, node, element) {
      this.temp_node = node
      if (node.level !== 1) {
        this.temp_module_id = data.id
      }
      this.currentProject = this.getCurrentProject(node.level === 1 ? data.id : data.project_id)

      // 点击的是项目，且项目下无节点，则获取项目下的节点
      if (node.level === 1 && (!node.data.children || node.data.children.length < 1)) {
        moduleTree({'project_id': data.id}).then(response => {
          if (this.showMessage(this, response)) {
            var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data
            let parse_data = this.arrayToTree(response_data, null)
            this.$set(data, 'children', parse_data)
          }
        })
      }
      // 展开/收缩节点
      this.$refs.tree.store.nodesMap[data.id].expanded = !this.$refs.tree.store.nodesMap[data.id].expanded
    },

    // 获取项目列表
    getProjectList() {
      projectList().then(response => {
        this.tempProjectList = response.data.data
        this.dataList = response.data.data
      })
    },

    // 获取项目
    getCurrentProject(project_id) {
      for (let index in this.tempProjectList) {
        let currentProject = this.tempProjectList[index]
        if (currentProject.id === project_id) {
          return currentProject
        }
      }
    },

    // 关键字查询模块
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },

    // 点击删除节点
    clickDeleteChild(node, data) {
      this.confirmBox(this.deleteChild, data, data.name)
    },

    // 删除节点
    deleteChild(data) {
      deleteModule({'id': data.id}).then(response => {
        if (this.showMessage(this, response)) {
          this.$refs.tree.remove(data)
        }
      })
    },

    /**
     * 拖拽排序
     * start_node: 被拖拽节点对应的 Node、
     * end_node: 结束拖拽时最后进入的节点（可能为空）、
     * position: 被拖拽节点的放置位置（before、after、inner）、event
     * event
     */
    nodeDragEnd(start_node, end_node, position, event) {


    },

    // 添加接口
    addApi(node, data) {
      this.temp_node = node
      this.temp_module_id = data.id
      // 由于 body 组件监听时会解析请求体，所以这给个默认值
      this.$bus.$emit(this.$busEvents.apiDialogStatus, 'add', {
        data_type: 'json',
        data_json: {},
        data_form: [{key: null, data_type: null, remark: null, value: null}]
      })
    },

    // 下载接口模板
    downloadTemplate() {
      downloadApiMsgTemplate().then(response => {
        let blob = new Blob([response], {
          type: 'application/vnd.ms-excel'   //将会被放入到blob中的数组内容的MIME类型
        });
        // 保存文件到本地
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob);  //生成一个url
        a.download = '接口导入模板'
        a.click()
      })
    },

    // 从excel导入接口
    showUploadFileDialog(node, data) {
      this.temp_node = node
      this.temp_module_id = data.id
      this.uploadFileDialogIsShow = true
    },

    // 从excel导入接口
    uploadFile(response, file) {
      let form = new FormData();
      form.append("file", file.raw);
      form.append("id", this.temp_module_id);
      uploadApi(form).then((response) => {
          if (this.showMessage(this, response)) {
            this.fileDataList = []
            this.uploadFileDialogIsShow = false
          }
        }
      )
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
};
</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
