import request from '@/utils/request';  //加载请求配置文件

function Func(method, data = null, params = null) {
  return request({url: '/api/task', method: method, data: data, params: params});
}

// 获取任务信息
export function getTask(params) {
  return Func('get', null, params)
}

// 添加任务信息
export function postTask(data) {
  return Func('post', data)
}

// 修改任务信息
export function putTask(data) {
  return Func('put', data)
}

// 删除任务信息
export function deleteTask(data) {
  return Func('delete', data)
}

// 任务列表
export function taskList(params) {
  return request({url: '/api/task/list', method: 'get', params: params});
}

// 启用任务
export function enableTask(data) {
  return request({url: '/api/task/status', method: 'post', data: data});
}

// 禁用任务
export function disableTask(data) {
  return request({url: '/api/task/status', method: 'delete', data: data});
}

// 单次运行定时任务
export function runTask(data) {
  return request({url: '/api/task/run', method: 'post', data: data});
}
