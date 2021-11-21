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
                  :default-expanded-keys="[defaultCaseSet]"
                  :empty-text="'请先创建项目'"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  :highlight-current="true"
                  lazy
                  node-key="id"
                  @node-click="getCaseSetList"
                  @node-drag-end="nodeDragEnd">
          <span slot-scope="{ node, data }"
                class="custom-tree-node"
                @mouseenter="mouseenter(data)"
                @mouseleave="mouseleave(data)">
            <span>{{ data.name }}</span>
            <span v-show="data.showMenu">
              <el-tooltip :content="node.level !== 1 ? '为当前用例集添加子用例集' : '为当前项目添加用例集'"
                          class="item"
                          effect="dark"
                          placement="top-start">
                <el-button icon="el-icon-plus"
                           size="mini"
                           type="text"
                           @click.stop="showCaseSetDialog('add', node, data)"></el-button>
              </el-tooltip>

              <el-tooltip class="item" content="修改当前用例集名" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           icon="el-icon-edit"
                           size="mini"
                           type="text"
                           @click.stop="showCaseSetDialog('edit', node, data)"
                ></el-button>
              </el-tooltip>

              <el-tooltip class="item" content="删除当前用例集" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           icon="el-icon-delete"
                           size="mini"
                           type="text"
                           @click.stop="clickDeleteChild(node, data)"
                ></el-button>
              </el-tooltip>

              <el-tooltip class="item" content="为当前用例集添加用例" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           icon="el-icon-share"
                           size="mini"
                           type="text"
                           @click.stop="addCase(node, data)"
                ></el-button>
              </el-tooltip>

              <el-tooltip class="item" content="运行当前用例集下的用例" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           v-show="!data.runButtonIsNotShow"
                           size="mini"
                           type="text"
                           icon="el-icon-video-play"
                           @click.stop="runCaseSet(node, data)"
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

      <!-- 第二列，用例列表 -->
      <el-col style="width: 79%; margin-left: 5px">
        <!-- 用例管理组件 -->
        <caseManage
          :currentCaseSet="temp_data"
          :currentProject="currentProject"
        ></caseManage>
      </el-col>

    </el-row>

    <!-- 新增/修改用例集表单 -->
    <el-dialog
      :close-on-click-modal="false"
      :title=" dialogStatus === 'add' ? '新增用例集' : '修改用例集' "
      :visible.sync="dialogFormVisible"
      width="40%">
      <el-form
        ref="dataForm"
        :model="tempDataForm"
        :rules="rules"
        label-position="left"
        label-width="100px"
        style="min-width: 400px;">
        <el-form-item :label="'用例集名称'" class="filter-item" prop="name" size="mini">
          <el-input v-model="tempDataForm.name" placeholder="同一节点下，用例集名称不可重复"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsShow"
          @click=" dialogStatus === 'add' ? addCaseSet() : changCaseSet() ">
          {{ '确定' }}
        </el-button>
      </div>
    </el-dialog>

  </div>


</template>

<script>
import caseManage from '@/views/case'  // 用例管理组件
import waves from "@/directive/waves";
import {projectList} from "@/apis/project";
import {caseSetTree, caseSetRun, deleteCaseSet, postCaseSet, putCaseSet} from "@/apis/caseSet";
import {reportIsDone} from "@/apis/report";


export default {
  name: 'index',
  components: {
    caseManage
  },
  directives: {waves},
  data() {
    return {
      // 查询关键字
      filterText: '',

      submitButtonIsShow: false,

      projectTab: '项目和用例集',

      defaultCaseSet: {},
      dataList: [],
      temp_node: {},
      temp_data: {},
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
      // 检验规则
      rules: {
        name: [{required: true, message: '请输入用例集名称', trigger: 'blur'}]
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

    // 打开用例集编辑框
    showCaseSetDialog(command, node, data) {
      this.dialog_temp_node = node
      this.dialog_temp_data = data
      this.dialogStatus = command
      this.tempDataForm.name = command === 'edit' ? this.dialog_temp_data.name : ''
      this.dialogFormVisible = true
    },

    // 添加用例集
    addCaseSet() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.submitButtonIsShow = true
          postCaseSet({
            name: this.tempDataForm.name,
            id: '',
            num: '',
            level: this.dialog_temp_node.level + 1,
            parent: this.dialog_temp_node.level === 1 ? null : this.dialog_temp_node.data.id,
            // node为第一级，则说明是项目级，直接取id，非第一级，则取当前node的project_id
            project_id: this.dialog_temp_node.level === 1 ? this.dialog_temp_node.data.id : this.dialog_temp_node.data.project_id,
          }).then(response => {
            this.submitButtonIsShow = false
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

    // 修改用例集
    changCaseSet() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.submitButtonIsShow = true
          putCaseSet({
            name: this.tempDataForm.name,
            id: this.dialog_temp_data.id,
            num: this.dialog_temp_data.num,
            level: this.dialog_temp_data.level,
            parent: this.dialog_temp_data.parent,
            project_id: this.dialog_temp_data.project_id,
          }).then(response => {
            this.submitButtonIsShow = false
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
        if (item.parent === parentId) {
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
    getCaseSetList(data, node, element) {
      this.temp_node = node
      this.temp_data = node.level !== 1 ? data : this.temp_data
      this.currentProject = this.getCurrentProject(node.level === 1 ? data.id : data.project_id)

      // 点击的是项目，且项目下无节点，则获取项目下的节点
      if (node.level === 1 && (!node.data.children || node.data.children.length < 1)) {
        caseSetTree({'project_id': data.id}).then(response => {
          var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data
          let parse_data = this.arrayToTree(response_data, null)
          this.$set(data, 'children', parse_data)
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

    // 关键字查询用例集
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
      deleteCaseSet({'id': data.id}).then(response => {
        if (this.showMessage(this, response)) {
          this.$refs.tree.remove(data)
        }
      })
    },

    // 添加用例
    addCase(node, data) {
      this.temp_node = node
      this.temp_data = data
      this.$bus.$emit(this.$busEvents.caseDialogStatus, 'add')
    },

    // 运行用例集的用例
    runCaseSet(node, data) {
      this.$set(data, 'runButtonIsNotShow', true)
      caseSetRun({'id': data.id}).then(runResponse => {
        if (this.showMessage(this, runResponse)) {

          // 触发运行成功，每三秒查询一次，
          // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
          // 已出结果，则停止查询，展示测试报告
          var that = this
          var queryCount = 0
          var timer = setInterval(function () {
            if (queryCount <= 10) {
              reportIsDone({'id': runResponse.data.report_id}).then(queryResponse => {
                if (queryResponse.data === 1) {
                  that.$set(data, 'runButtonIsNotShow', false)
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.$set(data, 'runButtonIsNotShow', false)
              that.$notify({
                title: '测试长时间未运行结束',
                message: '测试长时间未运行结束，不再等待，请到测试报告页查看测试报告',
                type: 'warning',
                duration: 0
              });
              clearInterval(timer)  // 关闭定时器
            }
          }, 3000)
        }
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
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
