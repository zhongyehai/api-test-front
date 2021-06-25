<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',

  // 解决因页面刷新，vuex中状态丢失的问题，刷新时将vuex的值保存在 localStorage , 刷新完成读取出来，

  // 方案一：配合store.index.state的赋值
  mounted() {
    // 页面加载完毕时添加刷新页面的监听事件
    // window.addEventListener('unload', this.saveState)
    window.addEventListener('beforeunload', this.saveState)
  },
  methods: {
    saveState() {
      // 把this.$store.state保存到localStorage.state
      localStorage.setItem('state', JSON.stringify(this.$store.state))
    }
  }



  // 方案二：从监听事件解决，参考：https://www.cnblogs.com/attacking-cabbage/p/10846211.html
  // created() {
  //   // 刷新时将vuex的值保存在 localStorage ,刷新完成读取出来
  //   let storeKey = 'state'
  //   // 保存 vuex中的状态到 localStorage.state
  //   window.addEventListener("beforeunload",()=>{
  //     window.localStorage.setItem(storeKey, JSON.stringify(this.$store.state))
  //   })
  //    // 如果 localStorage.state 有值，则取出来赋给vuex.state
  //   if (window.localStorage.getItem(storeKey) ) {
  //     this.$store.replaceState(Object.assign({}, this.$store.state,JSON.parse(window.localStorage.getItem(storeKey))))
  //   }
  // }
}
</script>

<style scoped>
  /*统一背景色*/
  /*#app{*/
  /*  background-color: #0066cc;*/
  /*}*/
</style>
