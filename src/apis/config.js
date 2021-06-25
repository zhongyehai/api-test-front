import request from '@/utils/request';  // 加载请求配置文件

function Func(method, data = null, params = null) {
  return request({url: '/api/config', method: method, data: data, params: params});
}

// 添加配置
export function postConfig(data) {
  return Func('post', data)
}

// 查找配置
export function getConfig(params) {
  return Func('get', null, params)
}

// 修改配置
export function putConfig(data) {
  return Func('put', data)
}

// 删除配置
export function deleteConfig(data) {
  return Func('delete', data)
}

// 获取配置list
export function configList(params) {
  return request({url: '/api/config/list', method: 'get', params: params});
}
