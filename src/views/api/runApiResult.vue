<template>
  <div class="result">
    <el-dialog
      title="测试结果"
      :visible.sync="resultViewStatus"
      :close-on-click-modal="false"
      width="60%"
    >
      <el-collapse accordion>
        <el-collapse-item
          v-for="(item, index) in resultData.resultShowData"
          :key="index"
        >
          <template slot="title">
            <div :style="item.attachment ? 'color:rgb(255, 74, 74)': 'color:#45b90c'">{{ item.name }}</div>
          </template>

          <el-tabs type="card">
            <!--            <el-tab-pane label="返回结果">-->
            <!--              <el-scrollbar wrapStyle="max-height:540px;">-->
            <!--                <div>-->
            <!--                  <pre style="overflow: auto;">{{ parseResultDeal(item.meta_datas.data[0].response.json) }}</pre>-->
            <!--                </div>-->
            <!--              </el-scrollbar>-->
            <!--            </el-tab-pane>-->


            <el-tab-pane label="返回信息">
              <el-collapse v-model="defaultShowResponseInFo">
                <el-collapse-item title="响应状态码：" name="1">
                  <div>{{ item.meta_datas.data[0].response.status_code }}</div>
                </el-collapse-item>
                <el-collapse-item title="响应数据：" name="2">
                  <pre style="overflow: auto;color: #000000">{{
                      parseResultDeal(item.meta_datas.data[0].response.json)
                    }}</pre>
                </el-collapse-item>
                <el-collapse-item title="头部信息：" name="3">
                  <pre style="overflow: auto;color: #000000">{{ item.meta_datas.data[0].response.headers }}</pre>
                </el-collapse-item>
                <el-collapse-item title="cookies：" name="4">
                  <pre style="overflow: auto;color: #000000">{{ item.meta_datas.data[0].response.cookies }}</pre>
                </el-collapse-item>
                <el-collapse-item title="content-type：" name="5">
                  <div>{{ item.meta_datas.data[0].response.content_type }}</div>
                </el-collapse-item>
                <el-collapse-item title="encoding：" name="6">
                  <div>{{ item.meta_datas.data[0].response.encoding }}</div>
                </el-collapse-item>
                <el-collapse-item title="地址：" name="7">
                  <div>{{ item.meta_datas.data[0].response.url }}</div>
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>

            <el-tab-pane label="提取信息">
              <div v-for="(value, key) in item.meta_datas.data[0].extract_msgs" :key="key">
                <el-row v-if="JSON.stringify(value) !== '{}'">
                  <el-col :span="8">
                    <div style="color: #409eff">{{ key }}：</div>
                  </el-col>
                  <el-col :span="16">
                    <pre style="color: #000000">{{ value }}</pre>
                  </el-col>
                </el-row>
                <hr>
              </div>
            </el-tab-pane>

            <el-tab-pane label="请求信息">
              <el-collapse v-model="defaultShowRequestInFo">
                <el-collapse-item title="请求方法：" name="1">
                  <div>{{ item.meta_datas.data[0].request.method }}</div>
                </el-collapse-item>
                <el-collapse-item title="请求地址：" name="2">
                  <div>{{ item.meta_datas.data[0].request.url }}</div>
                </el-collapse-item>
                <el-collapse-item title="查询字符串参数：" name="3">
                  <div>{{ item.meta_datas.data[0].request.params }}</div>
                </el-collapse-item>
                <el-collapse-item title="头部参数：" name="4">
                  <pre style="overflow: auto;color: #000000">{{ item.meta_datas.data[0].request.headers }}</pre>
                </el-collapse-item>
                <el-collapse-item title="json参数：" name="5">
                  <pre style="overflow: auto;color: #000000">{{ item.meta_datas.data[0].request.json }}</pre>
                </el-collapse-item>
                <el-collapse-item title="data参数：" name="6">
                  <div v-html="item.meta_datas.data[0].request.data"></div>
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>

            <el-tab-pane label="错误信息" v-if="item.attachment">
              <div>
                <pre style="overflow: auto">{{ item.attachment }}</pre>
              </div>
            </el-tab-pane>

          </el-tabs>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'runApiResult',
  props: [
    'runApiResultData'
  ],
  data() {
    return {
      defaultShowRequestInFo: ['1', '2', '3', '4', '5', '6'],  // 请求信息，默认展开全部
      defaultShowResponseInFo: ['1', '2', '3', '4', '5', '6', '7'],  // 响应信息，默认展开全部
      resultViewStatus: false,
      resultData: {
        out: '',
        resultShowData: [
          {
            name: null,
            attachment: null,
            meta_datas: {
              data: [{
                extract_msgs: {},
                request: {
                  body: null,
                  url: null,
                  headers: null,
                  data: null,
                  params: null,
                  json: null
                },
                response: {content: null, json: null}
              }]
            }
          }
        ]
      }
    }
  },
  methods: {
    parseResultDeal(data) {
      try {
        data = JSON.parse(data)
        data = JSON.stringify(data, null, 4)
      } catch (err) {
        null
      }
      return data
    },
  },

  watch: {
    'runApiResultData': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.resultData.resultShowData = newVal['details'][0]['records']
          this.resultViewStatus = true
        }

      }
    }
  }

}
</script>
<style>
</style>
