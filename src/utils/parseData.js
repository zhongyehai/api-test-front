// 截取字符串指定的长度
export function ellipsis(data, len) {
  if (!data) return ''
  if (data.length > len) {
    return data.slice(0, len) + '...'
  }
  return data
}

// 根据id从list中获取数据
export function getDataFormListById(data, data_id) {
  for (let index in data) {
    if (data[index].id === data_id) {
      return data[index]
    }
  }
}

// 根据name从list中获取数据
export function getDataFormListByName(data, data_name) {
  for (let index in data) {
    if (data[index].name === data_name) {
      return data[index]
    }
  }
}
