<template>
  <div class="app-container">
    <el-tree
      :data="data"
      node-key="id"
      default-expand-all
      @node-drag-start="handleDragStart"
      @node-drag-enter="handleDragEnter"
      @node-drag-leave="handleDragLeave"
      @node-drag-over="handleDragOver"
      @node-drag-end="handleDragEnd"
      @node-drop="handleDrop"
      draggable
      :allow-drop="allowDrop"
      :allow-drag="allowDrag"
      @node-click="clickNode"
    >

    </el-tree>
  </div>
</template>

<script>
export default {
  name: "test",
  data() {
    return {
      data: [{
        id: 1,
        label: '一级 1',
        children: [{
          id: 4,
          label: '二级 1-1',
          children: [{
            id: 9,
            label: '三级 1-1-1'
          }, {
            id: 10,
            label: '三级 1-1-2'
          }]
        }]
      }, {
        id: 2,
        label: '一级 2',
        children: [{
          id: 5,
          label: '二级 2-1'
        }, {
          id: 6,
          label: '二级 2-2'
        }]
      }, {
        id: 3,
        label: '一级 3',
        children: [{
          id: 7,
          label: '二级 3-1'
        }, {
          id: 8,
          label: '二级 3-2',
          children: [{
            id: 11,
            label: '三级 3-2-1'
          }, {
            id: 12,
            label: '三级 3-2-2'
          }, {
            id: 13,
            label: '三级 3-2-3'
          }]
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    };
  },
  methods: {
    clickNode(){
      console.log(1111111111)
    },

    handleDragStart(node, ev) {
      console.log('handleDragStart节点开始拖拽时触发的事件: ', node);
    },
    handleDragEnter(draggingNode, dropNode, ev) {
      console.log('handleDragEnter拖拽进入其他节点时触发的事件: ', dropNode.label);
    },
    handleDragLeave(draggingNode, dropNode, ev) {
      console.log('handleDragLeave拖拽离开某个节点时触发的事件: ', dropNode.label);
    },
    handleDragOver(draggingNode, dropNode, ev) {
      console.log('handleDragOver在拖拽节点时触发的事件: ', dropNode.label);
    },
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      console.log('handleDragEnd拖拽结束时触发的事件: ', dropNode && dropNode.label, dropType);
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log('handleDrop拖拽成功完成时触发的事件: ', dropNode.label, dropType);
    },
    allowDrop(draggingNode, dropNode, type) {
      if (dropNode.data.label === '二级 3-1') {
        return type !== 'inner';
      } else {
        return true;
      }
    },
    allowDrag(draggingNode) {
      return draggingNode.data.label.indexOf('三级 3-2-2') === -1;
    }
  }
}
</script>

<style scoped>

</style>
