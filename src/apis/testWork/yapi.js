import request from '@/utils/request';
import {baseDirTestWork} from "@/apis/base";  //加载请求配置文件

// 获取接口对比服务列表
export function getDiffRecordProjectList() {
  return request({url: baseDirTestWork + '/diffRecord/project', method: 'get'})
}

// 获取接口对比结果列表
export function getDiffRecordList(params) {
  return request({url: baseDirTestWork + '/diffRecord/list', method: 'get', params: params})
}

// 获取指定接口对比结果详情
export function getDiffRecord(params) {
  return request({url: baseDirTestWork + '/diffRecord/show', method: 'get', params: params})
}

// 导出指定接口对比结果为xmind
export function getDiffRecordAsXmind(params) {
  return request({url: baseDirTestWork + '/yapi/diff/download', method: 'get', params: params, responseType: 'blob'})
}

