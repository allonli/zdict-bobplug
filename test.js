const {
  getLiText,
  decodedText,
  getPText,
  extractPhoneticAndAudio,
  clearText,
  toJSON,
} = require("./util.js");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

function testGetLiText(query) {
  // 定义请求的URL
  const url = `https://www.zdic.net/hans/${encodeURIComponent(query.text)}`;
  // 发送GET请求
  axios
    .get(url)
    .then((response) => {
      var r;
      if (query.text.length === 1) {
        r = getLiText(response.data);
      } else if (query.text.length > 1) {
        r = getPText(response.data);
      }
      console.log(r.result.toDict.phonetics);
      console.log(r.result);
    })
    .catch((error) => {
      console.error("请求失败:", error);
    });
}

function testExtractPhoneticAndAudio() {
  // 示例用法
  const htmlContent =
    '<span class="z_d song">làng<span class="ptr"><a class="audio_play_button i_volume-up ptr" title="“浪”字的拼音" data-src-mp3="//img.zdic.net/audio/zd/py/làng.mp3"></a></span></span>';
  const result = extractPhoneticAndAudio(htmlContent);
  console.log(result); // 输出: { phonetic: 'làng', audioUrl: '//img.zdic.net/audio/zd/py/làng.mp3' }
}

function testClearText() {
  const text = clearText("(1)   [examine;check;inspect;review] ∶查看;查考");
  console.log(text);
}

// 定义查询参数
const query = { text: "鄯" };
const query2 = { text: "国" };
testGetLiText(query);
testGetLiText(query2);
