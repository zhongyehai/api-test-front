import request from '@/utils/request';  //加载请求配置文件

// 征信考试
export function examination() {
  return request({url: '/api/examination', method: 'get'});
}

// 获取生成用户信息可选项映射关系
export function makeUserInfoMapping() {
  return request({url: '/api/makeUserMapping', method: 'get'});
}

// 生成用户信息
export function makeUser(params) {
  return request({url: '/api/makeUser', method: 'get', params: params});
}
