import request from '@/utils/request';  //加载请求配置文件

// 征信考试
export function examination() {
  return request({url: '/api/examination', method: 'get'});
}
