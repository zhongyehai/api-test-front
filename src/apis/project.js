import request from '@/utils/request';  //加载请求配置文件

function Func(method, data = null, params = null) {
  return request({url: '/api/project', method: method, data: data, params: params});
}

// 添加服务
export function postProject(data) {
  return Func('post', data)
}

// 查找服务
export function getProject(params) {
  return Func('get', null, params)
}

// 修改服务
export function putProject(data) {
  return Func('put', data)
}

// 删除服务
export function deleteProject(data) {
  return Func('delete', data)
}

// 获取服务列表
export function projectList(params) {
  return request({url: '/api/project/list', method: 'get', params: params});
}

// 同步yapi的信息
export function projectPull(data) {
  return request({url: '/api/yapi/pull/all', method: 'post', data: data});
}
