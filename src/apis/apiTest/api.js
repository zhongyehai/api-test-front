import request from '@/utils/request';  //加载请求配置文件

export const uploadApiMsg = '/api/apiMsg/upload'

function Func(method, data = null, params = null) {
  return request({url: '/api/apiMsg', method: method, data: data, params: params});
}

// 添加接口信息
export function postApi(data) {
  return Func('post', data)
}

// 修改接口信息
export function putApi(data) {
  return Func('put', data)
}

// 获取api信息
export function getApi(params) {
  return Func('get', null, params)
}

// 删除api信息
export function deleteApi(data) {
  return Func('delete', data)
}

// 指定模块下接口list
export function uploadApi(data) {
  return request({url: '/api/apiMsg/upload', method: 'post', data: data});
}

// 下载接口模板
export function downloadApiMsgTemplate() {
  return request({url: '/api/apiMsg/template/download', method: 'get', responseType: 'blob'});
}

// 指定模块下接口list
export function apiList(params) {
  return request({url: '/api/apiMsg/list', method: 'get', params: params});
}

// 接口调试
export function runApi(data) {
  return request({url: '/api/apiMsg/run', method: 'post', data: data});
}

// 获取请求方式
export function getMethodsMapping() {
  return request({url: '/api/apiMsg/methods', method: 'get'});
}

// 获取断言类型
export function getAssertMapping() {
  return request({url: '/api/apiMsg/assertMapping', method: 'get'});
}

// 修改接口排序
export function apiMsgSort(data) {
  return request({url: '/api/apiMsg/sort', method: 'put', data: data});
}
