<template>

  <el-tabs v-model="activeName">

    <el-tab-pane label="form-data" name="data">
      <dataFormView :data-form="tempDataForm" ref="dataFormView"></dataFormView>
    </el-tab-pane>

    <el-tab-pane label="json" name="json">
      <jsonEditorView
          ref="jsonEditorView"
          :data-json="dataJson"
      ></jsonEditorView>
    </el-tab-pane>

    <el-tab-pane label="xml" name="xml">
<!--      <el-button type="primary" size="mini"-->
<!--                 v-show="tempDataType === 'xml'"-->
<!--                 style="margin-left:20px; float: right"-->
<!--                 @click="formatDataToJson()">格式化-->
<!--      </el-button>-->
      <el-input v-model="tempDataXml" type="textarea" :rows="17"></el-input>
    </el-tab-pane>

  </el-tabs>

</template>

<script>
import dataFormView from "@/components/Inputs/dataForm";
import dataJsonView from "@/components/Inputs/dataJson";
import jsonEditorView from "@/components/jsonView";


export default {
  name: "apiEditBody",
  components: {
    dataFormView,
    dataJsonView,
    jsonEditorView
  },
  props: ['dataType', 'dataJson', 'dataForm', 'dataXml'],
  data() {
    return {
      activeName: 'json',

      // form-data的类型，文本还是文件
      formDataTypes: ['string', 'file'],

      // form-data 的 空数据格式
      formDataFormat: {key: null, data_type: null, remark: null, value: null},

      // 当前上传文件的数据的索引值，上传文件后直接修改
      currentTempApiDataFormIndex: '',

      tempDataType: '',
      tempDataJson: '',
      tempDataForm: '',
      tempDataXml: '',
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.apiDialogStatus, (command, api) => {
      this.tempDataType = api.data_type
      this.tempDataJson = JSON.stringify(api.data_json)
      this.tempDataForm = api.data_form
      this.tempDataXml = api.data_xml
    })
  },

  // 组件销毁前，关闭bus监听请求方法选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.apiDialogStatus)
  },

  created() {
    this.tempDataType = this.dataType || 'json'
    this.tempDataJson = JSON.stringify(this.dataJson) || JSON.stringify({})
    this.tempDataForm = this.dataForm || [{key: null, data_type: null, remark: null, value: null}]
    this.tempDataXml = this.dataXml || ''
  },

  methods: {

    // 格式化json字符串
    formatDataToJson() {
      try {
        this.tempDataJson = JSON.stringify(JSON.parse(this.$refs.dataJsonView.tempDataJson), null, 4)
      } catch (err) {
        this.$notify.error('json格式错误')
      }
    },
  },
  watch: {

    'dataType': {
      handler(newVal, oldVal) {
        this.tempDataType = newVal || 'json'
      }
    },

    'dataJson': {
      handler(newVal, oldVal) {
        this.tempDataJson = JSON.stringify(newVal) || JSON.stringify({})
      }
    },

    'dataForm': {
      handler(newVal, oldVal) {
        this.tempDataForm = newVal || [{key: null, data_type: null, remark: null, value: null}]
      }
    },

    'dataXml': {
      handler(newVal, oldVal) {
        this.tempDataXml = newVal
      }
    },

  }
}
</script>

<style scoped>

</style>
