<template>
  <el-row>

    <el-col :span="8">
      <el-tabs v-model="beforeCaseActiveName">
        <el-tab-pane label="前置引用用例" name="beforeCaseActiveName">
          <el-table
            ref="beforeCaseTable"
            :data="tempBeforeCaseList"
            stripe
          >
            <el-table-column prop="id" label="序号" min-width="15%">
              <template slot-scope="scope">
                <span> {{ scope.$index + 1 }} </span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="用例名" min-width="55%">
              <template slot-scope="scope">
                <span> {{ scope.row.name }} </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="30%">
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="解除当前用例对此用例的引用" placement="top-end">
                  <el-button type="danger" size="mini"
                             @click.native="updateQuote('before_case', 'del', scope.row, scope.$index)">解除引用
                  </el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-col>

    <el-col :span="8">
      <el-tabs v-model="caseTreeActiveName">
        <el-tab-pane label="用例列表" name="caseTreeActiveName">

          <el-form label-width="60px">

            <el-row>

              <!-- 项目选择 -->
              <el-col :span="12">
                <el-form-item label="项目">
                  <el-select
                    v-model="projectSelectedId"
                    placeholder="选择项目"
                    size="small"
                    filterable
                    style="min-width: 20%;padding-right:10px"
                    @change="selectedProject"
                  >
                    <el-option v-for="(item) in currentProjectList"
                               :key="item.id"
                               :label="item.name"
                               :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <!-- 选则用例集 -->
              <el-col :span="12">
                <el-form-item label="用例集">
                  <el-select
                    v-model="currentCaseSetId"
                    placeholder="选择用例集"
                    size="small"
                    style="min-width: 20%;padding-right:10px"
                    @change="getCaseList"
                    filterable
                  >
                    <el-option v-for="(item) in currentCaseSetList"
                               :key="item.id"
                               :label="item.name"
                               :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 用例列表 -->
            <el-row>
              <el-table ref="caseTable" :data="caseList" stripe>
                <el-table-column prop="num" label="序号" min-width="15%">
                  <template slot-scope="scope">
                    <span> {{ scope.$index + 1 }} </span>
                  </template>
                </el-table-column>

                <el-table-column :show-overflow-tooltip=true prop="name" label="用例名称" min-width="55%">
                  <template slot-scope="scope">
                    <span> {{ scope.row.name }} </span>
                  </template>
                </el-table-column>

                <el-table-column label="操作" min-width="30%">
                  <template slot-scope="scope">

                    <el-tooltip class="item" effect="dark" content="添加到前置用例" placement="top-end">
                      <el-button type="primary"
                                 size="mini"
                                 icon="el-icon-back"
                                 @click.native="updateQuote('before_case', 'add', scope.row)">
                      </el-button>
                    </el-tooltip>

                    <el-tooltip class="item" effect="dark" content="添加到后置用例" placement="top-end">
                      <el-button type="primary"
                                 size="mini"
                                 icon="el-icon-right"
                                 @click.native="updateQuote('after_case', 'add', scope.row)">
                      </el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>

              <pagination
                v-show="caseTotal>0"
                :total="caseTotal"
                :page.sync="pageNum"
                :limit.sync="pageSize"
                @pagination="getCaseList"
              />
            </el-row>
          </el-form>

        </el-tab-pane>
      </el-tabs>
    </el-col>

    <el-col :span="8">
      <el-tabs v-model="afterCaseActiveName">
        <el-tab-pane label="后置引用用例" name="afterCaseActiveName">
          <el-table
            ref="afterCaseTable"
            :data="tempAfterCaseList"
            stripe
          >
            <el-table-column prop="id" label="序号" min-width="15%">
              <template slot-scope="scope">
                <span> {{ scope.$index + 1 }} </span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="用例名" min-width="55%">
              <template slot-scope="scope">
                <span> {{ scope.row.name }} </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="30%">
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="解除当前用例对此用例的引用" placement="top-end">
                  <el-button type="danger" size="mini"
                             @click.native="updateQuote('after_case', 'del', scope.row, scope.$index)">解除引用
                  </el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-col>

  </el-row>
</template>

<script>
import Pagination from '@/components/Pagination'

import {caseName, changeCaseQuote} from "@/apis/case";
import {projectList} from "@/apis/project";
import {caseSetTree} from "@/apis/caseSet";
import {caseList} from "@/apis/case";

export default {
  name: "quoteCase",
  components: {Pagination},
  props: [
    "tempCase",
    "beforeCase",
    "afterCase",
    "dialogIsShow"  // 是否查询前后置用例的名字
  ],
  data() {
    return {
      tempBeforeCaseIdList: [],
      tempBeforeCaseList: [],
      tempAfterCaseIdList: [],
      tempAfterCaseList: [],
      beforeCaseActiveName: 'beforeCaseActiveName',
      caseTreeActiveName: 'caseTreeActiveName',
      afterCaseActiveName: 'afterCaseActiveName',

      projectSelectedId: '',
      currentCaseSetId: '',
      currentProjectList: [],
      currentCaseSetList: [],
      pageNum: 1,
      pageSize: 10,
      caseList: [],
      caseTotal: 0,
    }
  },
  mounted() {
    // 获取项目列表
    this.getProjectList()
  },
  created() {
    // 前置用例
    this.tempBeforeCaseIdList = this.beforeCase ? JSON.parse(JSON.stringify(this.beforeCase)) : []
    if (this.tempBeforeCaseIdList.length > 0) {
      caseName({'caseId': this.tempBeforeCaseIdList + ''}).then(response => {
        this.tempBeforeCaseList = response.data
      })
    }

    // 后置用例
    this.tempAfterCaseIdList = this.afterCase ? JSON.parse(JSON.stringify(this.afterCase)) : []
    if (this.tempAfterCaseIdList.length > 0) {
      caseName({'caseId': this.tempAfterCaseIdList + ''}).then(response => {
        this.tempAfterCaseList = response.data
      })
    }
  },
  methods: {

    // 获取项目列表
    getProjectList() {
      projectList().then(response => {
        this.currentProjectList = response.data.data
      })
    },

    // 选中项目，获取对应的用例集
    selectedProject(projectId) {
      caseSetTree({'project_id': projectId}).then(response => {
        this.currentCaseSetId = ''
        this.currentCaseSetList = response.data
      })
    },

    // 选中用例集，获取对应的用例列表
    getCaseList(caseSetId) {
      caseList({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        setId: this.currentCaseSetId
      }).then(response => {
        this.caseList = response.data.data
        this.caseTotal = response.data.total
      })
    },

    // 更新引用关系
    updateQuote(position, type, row, index) {

      // 如果用例不存在，则先保存用例
      if (!this.tempCase.id) {
        this.$bus.$emit(this.$busEvents.isAddStepTriggerSaveCase, 'true')
      }

      // 如果用例已存在，则添加前置/后置条件
      if (this.tempCase.id) {

        var temp_data = []
        var tempCaseIdList = []
        var tempCaseList = []
        if (position === 'before_case') {
          temp_data = JSON.parse(JSON.stringify(this.tempBeforeCaseIdList))
          tempCaseIdList = this.tempBeforeCaseIdList
          tempCaseList = this.tempBeforeCaseList
        } else {
          temp_data = JSON.parse(JSON.stringify(this.tempAfterCaseIdList))
          tempCaseIdList = this.tempAfterCaseIdList
          tempCaseList = this.tempAfterCaseList
        }
        if (type === 'add') {
          temp_data.push(row.id)
        } else {
          temp_data.splice(index, 1)
        }
        changeCaseQuote({
          id: this.tempCase.id,
          quoteType: position,
          quote: temp_data,
        }).then(response => {
          if (this.showMessage(this, response)) {
            if (type === 'add') {
              tempCaseIdList.push(row.id)
              tempCaseList.push({id: row.id, name: row.name})
            } else {
              tempCaseIdList.splice(index, 1)
              tempCaseList.splice(index, 1)
            }
          }
        })
      }
    },
  },
  watch: {

    'beforeCase': {
      deep: true,
      handler(newVal, oldVal) {
        this.tempBeforeCaseList = []
        this.tempBeforeCaseIdList = newVal
        if (this.dialogIsShow) {
          // 获取前置用例
          if (this.tempBeforeCaseIdList && this.tempBeforeCaseIdList.length > 0) {
            caseName({'caseId': this.tempBeforeCaseIdList + ''}).then(response => {
              this.tempBeforeCaseList = response.data
            })
          }
        }
      }
    },

    'afterCase': {
      deep: true,
      handler(newVal, oldVal) {
        this.tempAfterCaseList = []
        this.tempAfterCaseIdList = newVal
        if (this.dialogIsShow) {
          // 获取后置用例
          if (this.tempAfterCaseIdList && this.tempAfterCaseIdList.length > 0) {
            caseName({'caseId': this.tempAfterCaseIdList + ''}).then(response => {
              this.tempAfterCaseList = response.data
            })
          }
        }
      }
    },
  }
}
</script>

<style scoped>

</style>
