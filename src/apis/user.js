import request from '@/utils/request'

function Func(method, data = null, params = null) {
  return request({url: '/api/user', method: method, data: data, params: params});
}

// 登录
export function login(data) {
  return request({url: '/api/login', method: 'post', data})
}

// 退出登录
export function logout() {
  return request({url: '/api/logout', method: 'post'})
}

// 获取用户信息
export function getUser(params) {
  return Func('get', null, params)
}

// 新增用户
export function postUser(data) {
  return Func('post', data)
}

// 修改用户
export function putUser(data) {
  return Func('put', data)
}

// 删除用户
export function deleteUser(data) {
  return Func('delete', data)
}

// 用户列表
export function userList(params) {
  return request({url: '/api/user/list', method: 'get', params: params});
}

// 修改用户状态
export function userStatus(data) {
  return request({url: '/api/user/status', method: 'put', data: data});
}

// 修改密码
export function userPassword(data) {
  return request({url: '/api/user/password', method: 'put', data: data});
}

// 角色列表
export function roleList() {
  return request({url: '/api/role/list', method: 'get'});
}

export function getInfo(token) {
  return request({url: '/vue-admin-template/user/info', method: 'get', params: {token}})
}
