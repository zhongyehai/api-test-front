import request from '@/utils/request';  //加载请求配置文件

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
