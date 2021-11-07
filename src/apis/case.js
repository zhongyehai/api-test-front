import request from '@/utils/request';  // 加载请求配置文件

function Func(method, data = null, params = null) {
  return request({url: '/api/case', method: method, data: data, params: params});
}

// 添加用例
export function postCase(data) {
  return Func('post', data)
}

// 查找用例
export function getCase(params) {
  return Func('get', null, params)
}

// 修改用例
export function putCase(data) {
  return Func('put', data)
}


// 删除用例
export function deleteCase(data) {
  return Func('delete', data)
}

// 运行测试用例，并生成报告
export function caseRun(data) {
  return request({ url: '/api/case/run', method: 'post', data: data })
}

// 修改用例状态
export function putCaseIsRun(data) {
  return request({url: '/api/case/changeIsRun', method: 'put', data: data});
}

// 获取用例list
export function caseList(params) {
  return request({url: '/api/case/list', method: 'get', params: params});
}

// 根据用例id获取用例名
export function caseName(params) {
  return request({url: '/api/case/name', method: 'get', params: params});
}

// 修改用例的引用关系
export function changeCaseQuote(data) {
  return request({url: '/api/case/quote', method: 'put', data: data});
}

// 复制用例
export function copyCase(params) {
  return request({url: '/api/case/copy', method: 'get', params: params});
}
