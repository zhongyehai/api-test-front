import request from '@/utils/request'

// title统计
export function getTitleCount() {
  return request({ url: '/api/count/title', method: 'get' })
}

// 对应的明细统计, detailType 对应的项，project、task、report...
export function getDetailCount(detailType) {
  return request({ url: '/api/count/' + detailType, method: 'get' })
}
