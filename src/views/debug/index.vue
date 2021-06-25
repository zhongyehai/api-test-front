<template>
  <!--  <el-tree class="filter-tree"-->
  <!--           :render-content="renderContent"-->
  <!--           :data="data"-->
  <!--           :props="defaultProps"-->
  <!--           ref="tree">-->
  <!--  </el-tree>-->

<!--  <el-tree default-expand-all :data="data">-->
<!--   <span class="custom-tree-node"-->
<!--         slot-scope="{ node, data }"-->
<!--         style="width:100%;"-->
<!--         @mouseenter="mouseenter(data)"-->
<!--         @mouseleave="mouseleave(data)">-->
<!--    <span>{{ node.label }}</span>-->
<!--     <span v-show="data.show" size="mini" style="margin-left: 15px">添加</span>-->
<!--    </span>-->
<!--  </el-tree>-->

  <el-tree default-expand-all :data="data">
   <span
     class="custom-tree-node"
     slot-scope="{ node, data }"
     style="width:100%;"
     @mouseenter="mouseenter(data)"
     @mouseleave="mouseleave(data)">
    <span>{{ node.label }}</span>
       <el-link v-show="data.show" size="mini" style="margin-left: 5px" type="primary">添加</el-link>
    </span>
  </el-tree>

</template>

<script>
export default {
  data() {
    return {
      data: [
        {
          id: 0,
          label: '水果',
          show: false,
        },
        {
          id: 1,
          label: '手机',
          show: false,
        },
      ],

    }
  },
  methods: {
    mouseenter(data) {
      console.log('滑入了')
      data.show = true
    },

    mouseleave(data) {
      console.log('滑出了')
      data.show = false
    }
  }
}
</script>

<style scoped>

</style>
