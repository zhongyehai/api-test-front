import request from '@/utils/request';  //加载请求配置文件

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

