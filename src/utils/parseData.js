// 截取字符串指定的长度
export function ellipsis(data, len) {
  if (!data) return ''
  if (data.length > len) {
    return data.slice(0, len) + '...'
  }
  return data
}
