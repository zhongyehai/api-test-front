import request from '@/utils/request';


// title统计
export function getTitleCount() {
  return request({url: '/api/count/title', method: 'get'});
}
