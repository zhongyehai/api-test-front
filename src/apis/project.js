import request from '@/utils/request';  //加载请求配置文件

function Func(method, data = null, params = null) {
  return request({url: '/api/project', method: method, data: data, params: params});
}

// 添加项目
export function postProject(data) {
  return Func('post', data)
}

// 查找项目
export function getProject(params) {
  return Func('get', null, params)
}

// 修改项目
export function putProject(data) {
  return Func('put', data)
}

// 删除项目
export function deleteProject(data) {
  return Func('delete', data)
}

// 获取项目列表
export function projectList(params) {
  return request({url: '/api/project/list', method: 'get', params: params});
}
