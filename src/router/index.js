import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/*
路由参数说明：
详见：https://panjiachen.gitee.io/vue-element-admin-site/zh/guide/essentials/router-and-nav.html#%E9%85%8D%E7%BD%AE%E9%A1%B9

参数说明：
 hidden: true // (默认 false)，当设置 true 的时候该路由不会在侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 redirect: 'noRedirect' //当设置为 noRedirect 的时候该路由在面包屑导航中不可被点击

 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 alwaysShow: true

 name: 'router-name' // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 meta: {
  roles: ['admin', 'editor'] // 设置该路由进入的权限，支持多个权限叠加
  title: 'title' // 设置该路由在侧边栏和面包屑中展示的名字
  icon: 'svg-name' // 设置该路由的图标，支持 svg-class，也支持 el-icon-x element-ui 的 icon
  noCache: true // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
  breadcrumb: false //  如果设置为false，则不会在breadcrumb面包屑中显示(默认 true)
  affix: true // 如果设置为true，它则会固定在tags-view中(默认 false)

  // 当路由设置了该属性，则会高亮相对应的侧边栏。
  // 这在某些场景非常有用，比如：一个文章的列表页路由为：/article/list
  // 点击文章进入文章详情页，这时候路由为/article/1，但你想在侧边栏高亮文章列表的路由，就可以进行如下设置
  activeMenu: '/article/list'

 示例：
 {
  path: '/permission',
  component: Layout,
  redirect: '/permission/index', //重定向地址，在面包屑中点击会重定向去的地址
  hidden: true, // 不在侧边栏显示
  alwaysShow: true, //一直显示根路由
  meta: { roles: ['admin','editor'] }, //你可以在根路由设置权限，这样它下面所有的子路由都继承了这个权限
  children: [{
    path: 'index',
    component: ()=>import('permission/index'),
    name: 'permission',
    meta: {
      title: 'permission',
      icon: 'lock', //图标
      roles: ['admin','editor'], //或者你可以给每一个子路由设置自己的权限
      noCache: true // 不会被 <keep-alive> 缓存
    }
  }]
}
*/

// 没有权限要求的基本页面，所有角色都可访问
export const constantRoutes = [

  // 登录
  {
    path: '/login',
    component: () => import('@/views/users/login/index'),
    hidden: true
  },

  // 404
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  // 权限判断测试
  // {
  //   path: '/index',
  //   component: Layout,
  //   redirect: '/dashboard',
  //   children: [{
  //     path: 'dashboard',
  //     name: 'Dashboard',
  //     component: () => import('@/views/dashboard/index'),
  //     meta: {title: '权限判断', icon: 'dashboard', roles: [1, 2]}
  //   }]
  // },

  // 首页
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/dashboard/index'),
        meta: {title: '首页', icon: 'el-icon-s-home'}
      }]
  },

  // 接口测试
  {
    path: '/apiTest',
    component: Layout,
    redirect: '/apiTest/project',
    name: 'ApiTest',
    meta: {title: '接口测试', icon: 'el-icon-link'},
    children: [
      {
        path: 'project',
        name: 'Project',
        component: () => import('@/views/apiTest/project/index'),
        meta: {title: '服务管理', icon: 'el-icon-folder-opened'}
      },
      {
        path: 'api',
        name: 'Api',
        component: () => import('@/views/apiTest/module/index'),
        meta: {title: '接口管理', icon: 'el-icon-s-order'}
      },
      {
        path: 'case',
        name: 'Case',
        component: () => import('@/views/apiTest/caseSet/index'),
        meta: {title: '用例管理', icon: 'el-icon-tickets'}
      },
      {
        path: 'funcFile',
        name: 'FuncFile',
        component: () => import('@/views/apiTest/funcFile/index'),
        meta: {title: '函数文件', icon: 'el-icon-help'}
      },
      {
        path: 'task',
        name: 'Task',
        component: () => import('@/views/apiTest/task/index'),
        meta: {title: '定时任务', icon: 'el-icon-date'}
      },
      {
        path: 'reportShow',
        name: 'ReportShow',
        hidden: true,
        meta: {title: '查看测试报告', icon: 'form'},
        component: () => import('@/views/apiTest/report/show')
      },
      {
        path: 'report',
        name: 'Report',
        meta: {title: '测试报告', icon: 'el-icon-s-data'},
        component: () => import('@/views/apiTest/report/index')
      },
      {
        path: 'errorRecord',
        name: 'ErrorRecord',
        meta: {title: '执行错误记录', icon: 'el-icon-video-camera-solid'},
        component: () => import('@/views/apiTest/errorRecord/index')
      },
      {
        path: 'debug',
        name: 'debug',
        hidden: true,
        meta: {title: '调试界面', icon: 'form'},
        component: () => import('@/views/debug/index')
      },
    ]
  },

  // web测试
  {
    path: '/uiTest',
    component: Layout,
    redirect: '/webTest/project',
    name: 'UITest',
    meta: {title: 'UI测试', icon: 'el-icon-connection'},
    children: [
      // {
      //   path: 'project',
      //   name: 'Project',
      //   component: () => import('@/views/uiTest/project/index'),
      //   meta: {title: '项目管理', icon: 'el-icon-s-operation'}
      // },
      {
        path: 'pages',
        name: 'Pages',
        component: () => import('@/views/uiTest/pages/index'),
        meta: {title: '页面管理', icon: 'el-icon-s-operation'}
      },
      {
        path: 'page',
        name: 'Page',
        component: () => import('@/views/uiTest/pages/index'),
        meta: {title: '页面管理', icon: 'el-icon-s-operation'}
      },
    ]
  },

  // 配置管理
  {
    path: '/config',
    component: Layout,
    redirect: '/config',
    name: 'Config',
    meta: {title: '配置管理', icon: 'el-icon-setting'},
    children: [
      {
        path: 'type',
        name: 'ConfigType',
        meta: {title: '类型管理', icon: 'el-icon-star-off'},
        component: () => import('@/views/config/configType/index')
      },
      {
        path: 'args',
        name: 'Args',
        meta: {title: '参数管理', icon: 'el-icon-star-on'},
        component: () => import('@/views/config/configs/index')
      }
    ]
  },

  // 测试管理
  {
    path: '/testManage',
    component: Layout,
    redirect: '/testManage/kym',
    name: 'TestManage',
    meta: {title: '测试管理', icon: 'el-icon-magic-stick'},
    children: [
      {
        path: 'kym',
        name: 'KYM',
        component: () => import('@/views/testWork/kym'),
        meta: {title: 'KYM分析', icon: 'el-icon-edit-outline'}
      },
      {
        path: 'makeTestCase',
        name: 'MakeTestCase',
        component: () => import('@/views/testWork/makeTestCase'),
        meta: {title: '用例编写', icon: 'el-icon-s-opportunity'}
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('@/views/testWork/account'),
        meta: {title: '测试账号', icon: 'el-icon-s-check'}
      },
      {
        path: 'file',
        name: 'File',
        component: () => import('@/views/testWork/files'),
        meta: {title: '文件管理', icon: 'el-icon-files'}
      },
      {
        path: 'dataPool',
        name: 'DataPool',
        component: () => import('@/views/testWork/dataPool'),
        meta: {title: '数据池', icon: 'el-icon-s-operation'}
      },
      {
        path: 'autoTestUser',
        name: 'AutoTestUser',
        component: () => import('@/views/testWork/autoTestUser'),
        meta: {title: '自动化用户数据', icon: 'el-icon-s-custom'}
      },
      {
        path: 'diffRecord',
        name: 'DiffRecord',
        component: () => import('@/views/testWork/yapi/diffDecord'),
        meta: {title: 'yapi监控记录', icon: 'el-icon-video-camera-solid'}
      },
      {
        path: 'diffRecordShow',
        name: 'DiffRecordShow',
        hidden: true,
        component: () => import('@/views/testWork/yapi/diffDetailShow'),
        meta: {title: 'yapi对比详情'}
      }
    ]
  },

  // 小工具
  {
    path: '/tools',
    component: Layout,
    redirect: '/apiTest/project',
    name: 'Tools',
    meta: {title: '小工具', icon: 'el-icon-s-tools'},
    children: [
      {
        path: 'examination',
        name: 'Examination',
        component: () => import('@/views/tools/examination'),
        meta: {title: '征信考试', icon: 'form'}
      },
      {
        path: 'makeUserInfo',
        name: 'MakeUserInfo',
        component: () => import('@/views/tools/makeUserInfo'),
        meta: {title: '生成用户信息', icon: 'el-icon-s-unfold'}
      }

    ]
  },

  // 系统管理
  {
    path: '/manage',
    component: Layout,
    redirect: '/manage/user',
    name: 'Manage',
    meta: {title: '系统管理', icon: 'el-icon-s-custom', roles: [2, '2']},
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/users/user/index'),
        meta: {title: '用户管理', icon: 'el-icon-user-solid', roles: [2, '2']}
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/users/role/index'),
        meta: {title: '权限管理', icon: 'el-icon-user', roles: [2, '2']}
      }
    ]
  },

  // 操作手册
  {
    path: '/help',
    component: Layout,
    redirect: '/help/gitee',
    name: 'Help',
    meta: {title: '帮助', icon: 'el-icon-document'},
    children: [
      {
        path: 'https://gitee.com/Xiang-Qian-Zou/api-test-api/blob/master/%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.md',
        meta: {title: '操作手册：gitee', icon: 'el-icon-document'}
      },
      {
        path: 'https://github.com/zhongyehai/api-test-api/blob/main/%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.md',
        meta: {title: '操作手册：GitHub', icon: 'el-icon-document'}
      },
    ]
  },

  // 用 * 匹配404 必须放到最后面，意味着用以上的映射表都没有匹配到用户输入的路由，则跳转到404
  {path: '*', redirect: '/404', hidden: true}
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({y: 0}),
  routes: constantRoutes // 代表那些不需要动态判断权限的路由，如登录页、404、等通用页面
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
