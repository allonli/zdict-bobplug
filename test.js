const {
  getLiText,
  decodedText,
  getPText,
  extractPhoneticAndAudio,
  containChinese,
  clearText,
  toJSON,
} = require("./util.js");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

function testGetText(query) {
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
      console.log(JSON.stringify(r));
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
  const text = clearText(
`“天人莫测，言本则甚深”

摘录来自

大慈恩寺三藏法师传

[唐] 释慧立

此材料受版权保护。`)
    
  const copyrightPattern = /摘录来自[\s\S]*此材料受版权保护。/;
  const cleanedText = text.replace(copyrightPattern, "").replace("“", "").replace("”", "").trim();
  console.log(cleanedText);
}

function testContainChinese(str) {
  const result = containChinese(str);
  console.log(result);
}

// 定义查询参数
const query1 = { text: "鄯" };
const query2 = { text: "国" };
const query3 = { text: "吐谷渾" };
const query4 = { text: "吐蕃" };
const query5 = { text: "，" };
const query6 = { text: "䫻" };
const query7 = { text: "噍" };
// testGetText(query1);
// testGetText(query2);
// testGetText(query3);
// testGetText(query4);
// testGetText(query5);
// testGetText(query6);
// testGetText(query7);
testClearText();
// testContainChinese("䫻");