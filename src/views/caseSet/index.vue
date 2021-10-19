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
                  :current-node-key="currentNodeKey	"
                  :empty-text="'请先创建项目'"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  :highlight-current="true"
                  lazy
                  node-key="id"
                  @node-click="clickNode">
          <span slot-scope="{ node, data }"
                class="custom-tree-node"
                @mouseenter="mouseenter(data)"
                @mouseleave="mouseleave(data)">
            <span>{{ data.name }}</span>
            <span v-show="data.showMenu">
              <el-tooltip class="item" content="为当前模块添加用例" effect="dark" placement="top-start">
                <el-button v-if="node.level !== 1"
                           size="mini"
                           type="text"
                           @click="addCase(node, data)"
                > 添加用例 </el-button>
              </el-tooltip>
                <el-tooltip class="item" content="运行当前模块下的用例" effect="dark" placement="top-start">
                  <el-button v-if="node.level !== 1" size="mini" type="text" icon="el-icon-video-play"
                             @click="runModule(node, data)"
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
          :currentProject="currentProject"
          :currentModule="temp_data"
        ></caseManage>
      </el-col>

    </el-row>

  </div>


</template>

<script>
import apiManage from '@/views/api'  // 接口管理组件
import caseManage from '@/views/case'  // 接口管理组件
import waves from "@/directive/waves";
import {projectList} from "@/apis/project";
import {moduleTree, moduleRun} from "@/apis/module";


export default {
  name: 'index',
  components: {
    apiManage,
    caseManage
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
      temp_data: {},
      currentNodeKey: '',
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
    clickNode(data, node, element) {
      this.temp_node = node
      this.temp_data = node.level !== 1 ? data : this.temp_data
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
        this.dataList = response.data.data  // this.setChildren(response.data.data)
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

    // 添加用例
    addCase(node, data) {
      this.temp_node = node
      this.temp_data = data
      this.$bus.$emit(this.$busEvents.caseDialogStatus, 'add')
    },

    // 运行模块的用例
    runModule(node, data) {
      moduleRun({'id': data.id}).then(response => {
        this.openReportById(response.data.report_id)
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
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
