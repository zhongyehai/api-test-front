import request from '@/utils/request';  //加载请求配置文件

export const uploadAddr = '/api/upload'

// 上传文件
export function fileUpload(data) {
  return request({url: uploadAddr, method: 'post', data: data});
}
