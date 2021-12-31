// 根据服务id，从初始化的服务列表中取对应服务的hosts
export function parseHostByProjectId(project_list, project_id) {
  for (let project_index in project_list) {
    let project = project_list[project_index]
    if (project.id === project_id) {
      return project.hosts ? JSON.parse(project.hosts) : project.hosts
    }
  }
}

// 根据用户id，从初始化的用户列表中取对应用户的用户名
export function parseUserNameByUserId(user_list, user_id) {
  for (let index in user_list) {
    let user_data = user_list[index]
    if (user_data.id === user_id) {
      return user_data.name
    }
  }
}

// 从list中获取指定字段为指定值的数据
// [{'a': 1, 'b': 1}, {'a': 2, 'b': 2}]  ==> field: 'a', value: 2  ==> {'a': 2, 'b': 2}
export function getDataByField(list, field, value) {
  for (let i = 0; i < list.length; i++) {
    if (value === list[i][field]) {
      return list[i]
    }
  }
}
