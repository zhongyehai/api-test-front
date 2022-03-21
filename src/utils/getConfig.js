import {getConfigByName} from '@/apis/config/config'

// 获取配置的运行等待超时时间
export function getRunTimeout(_this) {
  let runTimeout = 0
  getConfigByName({'name': 'run_time_out'}).then(response => {
    _this.$busEvents.runTimeout = response.data.value
    runTimeout = response.data.value
  })
  return runTimeout

}

// // 获取配置的运行等待超时时间
// export function getRunTimeout(_this) {
//   let runTimeout = _this.$busEvents.runTimeout
//   if (!runTimeout) {
//     getConfigByName({'name': 'run_time_out'}).then(response => {
//       _this.$busEvents.runTimeout = response.data.value
//       runTimeout = response.data.value
//     })
//     return runTimeout
//   }
// }

