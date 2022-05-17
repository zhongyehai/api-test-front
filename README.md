# 注：此版本只支持接口自动化，后面不再维护，新版本请移步[测试平台](https://github.com/zhongyehai/test-platform-front)

# 基于 vue-admin-template 开发测试平台前端

# 线上预览：http://139.196.100.202/#/login  账号：tester、密码：123456

## 系统操作手册：[gitee](https://gitee.com/Xiang-Qian-Zou/api-test-api/blob/master/%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.md) ，[github](https://github.com/zhongyehai/api-test-api/blob/main/%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.md)

## 后端传送门：https://github.com/zhongyehai/api-test-api

## 步骤

```bash
# 1.安装node14.x，确保在 cmd 下 node -v 能出现版本号
# 2.克隆并进入项目目录
# 3.安装依赖
npm install --registry=https://registry.npm.taobao.org

# 4.启动服务
npm run dev

# 5.打包部署到生产
npm run build
```

浏览器访问 [http://localhost:8023](http://localhost:8023), 账号admin, 密码123456


## 其它

```bash
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```

### 创作不易，麻烦给个星哦

### QQ交流群：249728408
### 博客地址：https://www.cnblogs.com/zhongyehai/
