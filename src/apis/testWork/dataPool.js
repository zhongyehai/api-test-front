import request from '@/utils/request';  //加载请求配置文件

// 获取数据池数据
export function getDataPool() {
  return request({url: '/api/dataPool', method: 'get'})
}

// 自动化测试用户数据
export function getAutoTestUser() {
  return request({url: '/api/autoTestUser', method: 'get'})
}
