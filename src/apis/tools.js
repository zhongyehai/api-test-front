import request from '@/utils/request';  //加载请求配置文件

// 征信考试
export function examination() {
  return request({url: '/api/examination', method: 'get'});
}

// 获取生成用户信息可选项映射关系
export function makeUserInfoMapping() {
  return request({url: '/api/makeUserMapping', method: 'get'});
}

// 生成用户信息
export function makeUser(params) {
  return request({url: '/api/makeUser', method: 'get', params: params});
}


// 测试账号列表
export function accountList(params) {
  return request({url: '/api/account/list', method: 'get', params: params});
}

// 获取测试账号
export function getAccount(params) {
  return request({url: '/api/account', method: 'get', data: params});
}

// 添加测试账号
export function postAccount(data) {
  return request({url: '/api/account', method: 'post', data: data});
}

// 修改测试账号
export function putAccount(data) {
  return request({url: '/api/account', method: 'put', data: data});
}

// 删除测试账号
export function deleteAccount(data) {
  return request({url: '/api/account', method: 'delete', data: data});
}


