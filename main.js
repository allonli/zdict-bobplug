const { getLiText, getPText, decodedText } = require("./util.js");

log(JSON.stringify($env));

var items = [
  ["auto", "auto"],
  ["zh-Hans", "zh"],
  ["zh-Hant", "zh"],
  ["en", "en"],
  ["ja", "ja"],
];

var langMap = new Map(items);
var langMapReverse = new Map(
  items.map(([standardLang, lang]) => [lang, standardLang])
);
function supportLanguages() {
  return items.map(([standardLang, lang]) => standardLang);
}

const header = {
  "Content-Type": "text/html;charset=UTF-8",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
};

/**
 * 将消息写入日志文件。
 *
 * @param {string} msg - 要写入日志文件的消息。
 */
function log(msg) {
  // 使用 $file.write 方法将消息写入日志文件
  $file.write({
    // 将消息转换为 UTF-8 编码的数据
    data: $data.fromUTF8(msg + "\n"),
    // 指定日志文件的路径
    path: "$sandbox/bob.zdic.log",
  });
}

/**
 * 主翻译函数，用于处理查询并返回结果。
 *
 * https://bobtranslate.com/plugin/quickstart/translate.html
 *
 * @param {Object} query 翻译查询对象
 * @param {string} query.text 需要翻译的文本
 * @param {string} query.from 用户选中的源语言代码，可能是 auto
 * @param {string} query.to 用户选中的目标语言代码，可能是 auto
 * @param {string} query.detectFrom 检测过后的源语言，一定不是 auto，如果插件不具备检测语言的能力，可直接使用该属性
 * @param {string} query.detectTo 检测过后的目标语言，一定不是 auto，如果不想自行推测用户实际需要的目标语言，可直接使用该属性
 * @param {$signal} query.cancelSignal 取消信号，可直接将此对象透传给 $http 请求用于取消，同时也可以监听此信号做一些额外的逻辑
 * @param {Function} query.onStream 流式数据回调函数
 * @param {Function} query.onCompletion 处理响应的回调函数
 * @return {void}
 */
function translate(query, completion) {
  const url = `https://www.zdic.net/hans/${encodeURIComponent(query.text)}`;

  $http.request({
    method: "POST",
    url: url,
    header: header,
    handler: function (resp) {
      var htmlContent = resp.data;
      var r;
      // 检查query的字符串长度
      if (query.text.length === 1) {
        r = getLiText(htmlContent);
      } else if (query.text.length > 1) {
        r = getPText(htmlContent);
      }
      query.onCompletion(r);
    },
  });
}
