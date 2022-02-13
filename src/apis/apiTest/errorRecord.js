import request from '@/utils/request';  //加载请求配置文件

// 获取错误列表
export function errorRecordList(params) {
  return request({url: '/api/errorRecord/list', method: 'get', params: params});
}
