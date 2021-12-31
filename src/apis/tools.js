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
  return request({url: '/api/account', method: 'get', params: params});
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

// 添加kym
export function addKYM(data) {
  return request({url: '/api/kym/project', method: 'post', data: data})
}

// 获取kym服务列表
export function KYMProjectList() {
  return request({url: '/api/kym/project/list', method: 'get'})
}

// 获取服务的kym
export function getProjectKYM(params) {
  return request({url: '/api/kym', method: 'get', params: params})
}

// 修改服务的kym
export function putProjectKYM(data) {
  return request({url: '/api/kym', method: 'put', data: data})
}

// kym导出为xmind
export function getKymAsXmind(params) {
  return request({url: '/api/kym/download', method: 'get', params: params, responseType: 'blob'})
}

// 获取数据池数据
export function getDataPool() {
  return request({url: '/api/dataPool', method: 'get'})
}

// 获取接口对比服务列表
export function getDiffRecordProjectList() {
  return request({url: '/api/diffRecord/project', method: 'get'})
}

// 获取接口对比结果列表
export function getDiffRecordList(params) {
  return request({url: '/api/diffRecord/list', method: 'get', params: params})
}

// 获取指定接口对比结果
export function getDiffRecord(params) {
  return request({url: '/api/diffRecord', method: 'get', params: params})
}

// 导出指定接口对比结果为xmind
export function getDiffRecordAsXmind(params) {
  return request({url: '/api/yapi/diff/download', method: 'get', params: params, responseType: 'blob'})
}

