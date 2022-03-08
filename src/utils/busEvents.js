// bus监听事件常量方式

export default {

  // 树组件 监听事件
  projectTreeChoiceProject: 'projectTreeChoiceProject',  // 服务树选中服务事件
  moduleTreeChoiceModule: 'moduleTreeChoiceModule',  // 模块树选中模块事件
  moduleTreeCommand: 'moduleTreeCommand',  // 模块树选中模块要执行的命令，添加、修改
  caseSetTreeChoiceCaseSet: 'caseSetTreeChoiceCaseSet',  // 用例集树选中用例集事件
  caseSetCommand: 'caseSetCommand',  // 用例集树选中要执行的命令，添加、修改

  // 下拉框 监听事件
  projectSelectorChoiceProject: 'projectSelectorChoiceProject',  // 服务下拉框选中服务事件
  projectSelectorGetProjectList: 'projectSelectorGetProjectList',  // 服务下拉框获取服务列表事件

  moduleSelectorChoiceModule: 'moduleSelectorChoiceModule',  // 模块下拉框选中模块事件
  methodSelectorChoiceMethod: 'methodSelectorChoiceMethod',  // 请求方法下拉框选中请求方法事件
  caseSetSelectorChoiceCaseSet: 'caseSetSelectorChoiceCaseSet',  // 服务下拉框选中服务事件

  // dialog 监听事件
  showProjectDialog: 'showProjectDialog',  // 服务 Dialog 框 的状态，新增/编辑
  clickProjectEnv: 'clickProjectEnv',  // 服务环境编辑
  showEnvSynchronizer: 'showEnvSynchronizer',  // 服务环境同步编辑
  envSynchronizerIsSuccess: 'envSynchronizerIsSuccess',  // 服务环境同步完成
  projectDialogCommitSuccess: 'projectDialogCommitSuccess',  // 服务 Dialog 框 的提交状态

  moduleDialogCommit: 'moduleDialogCommit',  // 模块 Dialog 框提交事件
  moduleIndexAddApi: 'moduleIndexAddApi',  // 模块管理 首页点击添加接口事件

  apiDialogStatus: 'apiDialogStatus',  // 接口 Dialog 框 的状态，新增/编辑
  apiDialogCommitSuccess: 'apiDialogCommitSuccess',  // 接口 Dialog 框 的提交状态

  caseSetDialogCommit: 'caseSetDialogCommit',  // 用例集 Dialog 框提交事件
  caseSetIndexAddCase: 'caseSetIndexAddCase',  // 用例集管理 首页点击添加用例事件

  caseDialogStatus: 'caseDialogStatus',  // 用例 Dialog 框 的状态，新增/编辑
  caseDialogCommitSuccess: 'caseDialogCommitSuccess',  // 用例 Dialog 框 的提交状态
  isAddStepTriggerSaveCase: 'isAddStepTriggerSaveCase',  // 在添加步骤时触发的 保存用例，这个时候保存后不关闭 用例的Dialog 框

  addApiListToStepList: 'addApiListToStepList',  // 添加接口列表到步骤列表

  addApiToStep: 'addApiToStep', // 接口转为步骤
  editStep: 'editStep', // 编辑步骤
  addStepIsCommit: 'addStepIsCommit', // 新增步骤提交
  editStepIsCommit: 'editStepIsCommit', // 编辑步骤提交
  stepTabIsCommit: 'stepTabIsCommit',  // 步骤编辑tab已经提交

  addFuncFileDialogIsShow: 'addFuncFileDialogIsShow',  // 打开新增函数文件框
  editFuncFile: 'editFuncFile',  // 编辑函数文件
  editFuncFileIsCommit: 'editFuncFileIsCommit',  // 编辑函数文件已经提交
  addFuncFileIsCommit: 'addFuncFileIsCommit',  // 新增函数文件已经提交

  taskDialogIsShow: 'taskDialogIsShow',  // 打开定时任务编辑框
  taskDialogIsCommit: 'taskDialogIsCommit',  // 定时任务已提交

  configTypeList: 'configTypeList', // 配置类型列表
  configDialogIsShow: 'configDialogIsShow',  // 打开配置编辑框
  configDialogIsCommit: 'configDialogIsCommit',  // 配置已提交

  uploadFileDialogIsShow: 'uploadFileDialogIsShow',  // 打开文件上传
  uploadFileIsCommit: 'uploadFileIsCommit',  // 文件上传已提交

}
