<template>
  <div>
    <div class="block">
      <span class="demonstration">单选选择任意一级选项</span>
      <el-cascader
        ref="cascader"
        :options="module_tree"
        :props="{ checkStrictly: true }"
        v-model="selectedOptions"
        @change="selected"
        clearable></el-cascader>
    </div>
    <div class="block">
      <span class="demonstration">多选选择任意一级选项</span>
      <el-cascader
        :options="options"
        :props="{ multiple: true, checkStrictly: true }"
        v-model="option"
        @change="selected2"
        clearable></el-cascader>
    </div>
    <br>
    <hr>
    selectedOptions
    {{ selectedOptions }}

    <br>
    <hr>
    selected2Value
    {{ selected2Value }}

  </div>
</template>
<script>
import {moduleTree} from "@/apis/module";

export default {
  data() {
    return {
      // option: [ [ "zhinan", "shejiyuanze" ], [ "zhinan", "shejiyuanze", "yizhi" ], [ "zhinan", "shejiyuanze", "fankui" ] ],
      option: ["shejiyuanze", "yizhi", "fankui"],
      selectedOptions: [],
      selected2Value: [],
      module_tree: [],
      options: [
        {
          value: 'zhinan',
          label: '指南',
          children: [{
            value: 'shejiyuanze',
            label: '设计原则',
            children: [{
              value: 'yizhi',
              label: '一致'
            }, {
              value: 'fankui',
              label: '反馈'
            }, {
              value: 'xiaolv',
              label: '效率'
            }, {
              value: 'kekong',
              label: '可控'
            }]
          }, {
            value: 'daohang',
            label: '导航',
            children: [{
              value: 'cexiangdaohang',
              label: '侧向导航'
            }, {
              value: 'dingbudaohang',
              label: '顶部导航'
            }]
          }]
        }, {
          value: 'zujian',
          label: '组件',
          children: [{
            value: 'basic',
            label: 'Basic',
            children: [{
              value: 'layout',
              label: 'Layout 布局'
            }, {
              value: 'color',
              label: 'Color 色彩'
            }, {
              value: 'typography',
              label: 'Typography 字体'
            }, {
              value: 'icon',
              label: 'Icon 图标'
            }, {
              value: 'button',
              label: 'Button 按钮'
            }]
          }, {
            value: 'form',
            label: 'Form',
            children: [{
              value: 'radio',
              label: 'Radio 单选框'
            }, {
              value: 'checkbox',
              label: 'Checkbox 多选框'
            }, {
              value: 'input',
              label: 'Input 输入框'
            }, {
              value: 'input-number',
              label: 'InputNumber 计数器'
            }, {
              value: 'select',
              label: 'Select 选择器'
            }, {
              value: 'cascader',
              label: 'Cascader 级联选择器'
            }, {
              value: 'switch',
              label: 'Switch 开关'
            }, {
              value: 'slider',
              label: 'Slider 滑块'
            }, {
              value: 'time-picker',
              label: 'TimePicker 时间选择器'
            }, {
              value: 'date-picker',
              label: 'DatePicker 日期选择器'
            }, {
              value: 'datetime-picker',
              label: 'DateTimePicker 日期时间选择器'
            }, {
              value: 'upload',
              label: 'Upload 上传'
            }, {
              value: 'rate',
              label: 'Rate 评分'
            }, {
              value: 'form',
              label: 'Form 表单'
            }]
          }, {
            value: 'data',
            label: 'Data',
            children: [{
              value: 'table',
              label: 'Table 表格'
            }, {
              value: 'tag',
              label: 'Tag 标签'
            }, {
              value: 'progress',
              label: 'Progress 进度条'
            }, {
              value: 'tree',
              label: 'Tree 树形控件'
            }, {
              value: 'pagination',
              label: 'Pagination 分页'
            }, {
              value: 'badge',
              label: 'Badge 标记'
            }]
          }, {
            value: 'notice',
            label: 'Notice',
            children: [{
              value: 'alert',
              label: 'Alert 警告'
            }, {
              value: 'loading',
              label: 'Loading 加载'
            }, {
              value: 'message',
              label: 'Message 消息提示'
            }, {
              value: 'message-box',
              label: 'MessageBox 弹框'
            }, {
              value: 'notification',
              label: 'Notification 通知'
            }]
          }, {
            value: 'navigation',
            label: 'Navigation',
            children: [{
              value: 'menu',
              label: 'NavMenu 导航菜单'
            }, {
              value: 'tabs',
              label: 'Tabs 标签页'
            }, {
              value: 'breadcrumb',
              label: 'Breadcrumb 面包屑'
            }, {
              value: 'dropdown',
              label: 'Dropdown 下拉菜单'
            }, {
              value: 'steps',
              label: 'Steps 步骤条'
            }]
          }, {
            value: 'others',
            label: 'Others',
            children: [{
              value: 'dialog',
              label: 'Dialog 对话框'
            }, {
              value: 'tooltip',
              label: 'Tooltip 文字提示'
            }, {
              value: 'popover',
              label: 'Popover 弹出框'
            }, {
              value: 'card',
              label: 'Card 卡片'
            }, {
              value: 'carousel',
              label: 'Carousel 走马灯'
            }, {
              value: 'collapse',
              label: 'Collapse 折叠面板'
            }]
          }]
        }, {
          value: 'ziyuan',
          label: '资源',
          children: [{
            value: 'axure',
            label: 'Axure Components'
          }, {
            value: 'sketch',
            label: 'Sketch Templates'
          }, {
            value: 'jiaohu',
            label: '组件交互文档'
          }]
        }]
    };
  },
  mounted() {
    this.getModuleTree()
  },
  methods: {

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
          treeArr[index].value = treeArr[index].id
          treeArr[index].label = treeArr[index].name
          temp.push(treeArr[index]);
        }
      });
      return temp;
    },


    getModuleTree() {
      moduleTree({'project_id': 1}).then(response => {
        if (this.showMessage(this, response)) {
          var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data
          let parse_data = this.arrayToTree(response_data, null)
          this.module_tree = parse_data
        }
      })
    },

    // 选中事件
    selected(valueList) {
      if (valueList) {
        let selectedValue = valueList.slice(-1)
      }
      console.log('value: ', valueList)
      console.log('value: ', valueList.slice(-1))
    },

    // 选中事件
    selected2(valueList) {
      this.selected2Value = valueList
      if (valueList) {
        let selected2Value = valueList
      }
      console.log('value: ', valueList)
      console.log('value: ', valueList.slice(-1))
    },
  }
};
</script>

<style scoped>

</style>
