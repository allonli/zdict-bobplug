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
const {
  Result,
  Phonetic,
  Part,
  Exchange,
  RelatedWord,
  RelatedWordPart,
  Addition,
  Dict,
  TTSResult,
} = require("./Beans.js");

// 定义查询参数
const query = { text: "国" };

// 定义请求的URL
const url = `https://www.zdic.net/hans/${encodeURIComponent(query.text)}`;

// 发送GET请求
// axios
//   .get(url)
//   .then((response) => {
//     var r;

//     if (query.text.length === 1) {
//       r = getLiText(response.data);
//     } else if (query.text.length > 1) {
//       r = getPText(response.data);
//     }

//     console.log(r.result.toDict.phonetics);
//   })
//   .catch((error) => {
//     console.error("请求失败:", error);
//   });


// 示例用法
// const htmlContent = '<span class="z_d song">làng<span class="ptr"><a class="audio_play_button i_volume-up ptr" title="“浪”字的拼音" data-src-mp3="//img.zdic.net/audio/zd/py/làng.mp3"></a></span></span>';
// const htmlContent =
//   '<span class="z_d song">guó<span class="ptr"><a class="audio_play_button i_volume-up ptr" title="“国”字的拼音" data-src-mp3="//img.zdic.net/audio/zd/py/guó.mp3"></a></span></span>';
// const result = extractPhoneticAndAudio(htmlContent);
// console.log(result); // 输出: { phonetic: 'làng', audioUrl: '//img.zdic.net/audio/zd/py/làng.mp3' }

const text = clearText("(1)   [examine;check;inspect;review] ∶查看;查考");
console.log(text);



// {
//   result: {
//     toDict: {
//       additions: [
//         { name: "addition-name", value: "addition-value" },
//         { name: query.detectTo, value: query.detectFrom },
//       ],
//       phonetics: [
//         {
//           type: "us",
//           value: "ɡʊd",
//           tts: {
//             type: "url",
//             value: "https://img.zdic.net/audio/zd/py/l%C3%A0ng.mp3",
//           },
//         },
//       ],
//     },
//     toParagraphs: parseArr,
//   },
// }