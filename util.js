/**
 * 将对象转换为 JSON 格式
 * @param {Object} obj - 要转换的对象
 * @returns {Object} - 转换后的 JSON 对象
 */
function toJSON(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toJSON(item));
  }

  const jsonObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      jsonObj[key] = toJSON(obj[key]);
    }
  }
  return jsonObj;
}

// 用于单字提取音频地址或词提取拼音，只在子div中提取，如果没找到将在整个页面搜索dicpy div
function extractPhoneticAndAudio(htmlContent) {
  // 定义正则表达式，用于提取特定的字符串
  const extractRegex =
    /<span class="dicpy">([^<]+)<span class="ptr"><a class="audio_play_button i_volume-up ptr" data-src-mp3="([^"]+)"><\/a><\/span>.*?<\/span>/;

  // 使用正则表达式提取字符串
  const match = decodedText(htmlContent).match(extractRegex);

  if (match) {
    // 返回提取的字符串
    return {
      title: match[1].trim(),
      url: "https:" + match[2].replace("//", "/"),
    };
  } else {
    // 如果没有匹配到，返回空对象
    return {};
  }
}

/**
 * 从HTML内容中提取特定<div>标签内的所有<li>标签文本。
 *
 * @param {string} htmlContent - 包含HTML内容的字符串。
 * @returns {void} - 该函数不返回任何值，而是直接在控制台输出提取的文本。
 */
function getLiText(htmlContent, queryText) {
  // 定义正则表达式，用于匹配具有特定class的<div>标签及其内部内容
  const divRegex =
    /<div class="content definitions jnr"[^>]*>([\s\S]*?)<\/div>/;
  // 使用正则表达式匹配HTML内容
  const divMatch = htmlContent.match(divRegex);

  var arr = [];
  // 如果单字匹配成功
  if (divMatch) {
    // 获取匹配到的<div>标签内部的内容
    const divContent = divMatch[1];
    // 定义正则表达式，用于匹配<div>标签内部的所有<li>标签及其内部内容
    // const liRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/g;
    // const olRegex = /<ol>([\s\S]*?)<\/ol>/g;
    const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/;
    const olMatch = divContent.match(olRegex);
    // 使用正则表达式匹配HTML OL标签内的内容
    if (!olMatch) {
      return {
        result: {
          toParagraphs: ["未找到释义"],
        },
      };
    } else {
      const olContent = olMatch[0];
    }

    var regex;

    // 定义正则表达式，用于匹配<ol>标签内部的所有<li>标签及其内部内容
    const liRegex = /<li>([\s\S]*?)<\/li>/g;
    // 定义正则表达式，用于匹配<ol>标签内部的所有<p>标签及其内部内容
    const pRegex = /<p>([\s\S]*?)<\/p>/g;

    if (olContent.includes("<li>")) {
      regex = liRegex;
    } else if (olContent.includes("<p>")) {
      regex = pRegex;
    }

    // 初始化变量，用于存储每次匹配的结果
    let match;
    let count = 0;
    // 使用正则表达式循环匹配<div>标签内部的<li>标签
    while ((match = regex.exec(olContent)) !== null) {
      // 获取匹配到的<li>标签内部的内容，并去除其中的HTML标签
      const content = match[1].replace(/<[^>]+>/g, "");
      let decodeText = decodedText(++count + ". " + content);
      arr.push(decodeText);
    }

    const pair = extractPhoneticAndAudio(divContent);

    const r = {
      result: {
        toDict: {
          word: queryText,
          additions: [{ name: "详细解释", value: "--" }],
          phonetics: [
            {
              type: "uk",
              value: `${pair.title}`,
              tts: {
                type: "url",
                value: `${pair.url}`,
              },
            },
          ],
        },
        toParagraphs: arr.length === 0 ? ["未找到释义"] : arr,
      },
    };

    return r;
  }
}

function getPText(htmlContent, queryText) {
  // 正则表达式匹配<div class="jnr">内的所有<p>标签内容
  const regex = /<div class="jnr">[\s\S]*?<\/div>/g;
  const matches = decodedText(htmlContent).match(regex);

  var arr = [];
  if (matches) {
    // 遍历匹配结果
    matches.forEach((match) => {
      // 检查是否包含<p>标签，没有直接输出，有则提取<p>标签内容
      if (!/<p>/.test(match)) {
        var itemText = clearText(matches[0]);
        if (itemText.length > 0) {
          arr.push(itemText);
        }
      } else {
        // 正则表达式匹配每个<p>标签内容
        const pRegex = /<p>([\s\S]*?)<\/p>/g;
        let pMatch;
        while ((pMatch = pRegex.exec(match)) !== null) {
          var itemText = clearText(pMatch[1]);
          if (itemText.length > 0) {
            arr.push(itemText);
          }
        }
      }
    });
  }

  const pinyinRegex = /<span class="dicpy">([^<]+)<\/span>/;
  const piyinMatch = htmlContent.match(pinyinRegex);
  var word = queryText;
  // 使用正则表达式找到拼音
  if (piyinMatch) {
    word = queryText + " [" + piyinMatch[1] + "]";
  }

  const r = {
    result: {
      toDict: {
        word: word,
        additions: [{ name: "详细解释", value: "--" }],
      },
      toParagraphs: arr.length === 0 ? ["未找到释义"] : arr,
    },
  };

  return r;
}

function containChinese(text) {
  const regex =
    /[\u4e00-\u9fa5\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\u{2f800}-\u{2fa1f}]/u;
  if (!regex.test(text)) {
    return false;
  } else {
    return true;
  }
}

// 去掉这种的垃圾 [ask;request;beg;demand;seek] ∶
// 去掉各种标签
function clearText(str) {
  if (!containChinese(str)) {
    return "";
  }

  var removeMatch;
  const text = str.replace(/<[^>]+>/g, " ").trim();
  const checkRegex = /\[[^\]]+\]/;
  if (checkRegex.test(text)) {
    removeMatch = text.replace(checkRegex, "").replace(" ∶", " ");
  } else {
    removeMatch = text;
  }
  return removeMatch;
}

/**
 * 解码HTML实体字符
 *
 * @param {string} str - 包含HTML实体字符的字符串
 * @returns {string} - 解码后的字符串
 */
function decodedText(str) {
  // 定义一个对象，包含常见的HTML实体字符及其对应的字符
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&nbsp;": " ",
    "&ldquo;": "“",
    "&rdquo;": "”",
    "&bull;": "•",
    "&iexcl;": "¡",
    "&cent;": "¢",
    "&pound;": "£",
    "&curren;": "¤",
    "&yen;": "¥",
    "&brvbar;": "¦",
    "&sect;": "§",
    "&uml;": "¨",
    "&copy;": "©",
    "&#219;": "Û",
    "&reg;": "®",
    "&#158;": "ž",
    "&#220;": "Ü",
    "&#159;": "Ÿ",
    "&#221;": "Ý",
    "&#36;": "$",
    "&#222;": "Þ",
    "&#37;": "%",
    "&#161;": "¡",
    "&#223;": "ß",
    "&#162;": "¢",
    "&#224;": "à",
    "&#163;": "£",
    "&#225;": "á",
    "&Agrave;": "À",
    "&#164;": "¤",
    "&#226;": "â",
    "&Aacute;": "Á",
    "&#165;": "¥",
    "&#227;": "ã",
    "&Acirc;": "Â",
    "&#166;": "¦",
    "&#228;": "ä",
    "&Atilde;": "Ã",
    "&#167;": "§",
    "&#229;": "å",
    "&Auml;": "Ä",
    "&#168;": "¨",
    "&#230;": "æ",
    "&Aring;": "Å",
    "&#169;": "©",
    "&#231;": "ç",
    "&AElig;": "Æ",
    "&#170;": "ª",
    "&#232;": "è",
    "&Ccedil;": "Ç",
    "&#171;": "«",
    "&#233;": "é",
    "&Egrave;": "È",
    "&#172;": "¬",
    "&#234;": "ê",
    "&Eacute;": "É",
    "&#173;": "­",
    "&#235;": "ë",
    "&Ecirc;": "Ê",
    "&#174;": "®",
    "&#236;": "ì",
    "&Euml;": "Ë",
    "&#175;": "¯",
    "&#237;": "í",
    "&Igrave;": "Ì",
    "&#176;": "°",
    "&#238;": "î",
    "&Iacute;": "Í",
    "&#177;": "±",
    "&#239;": "ï",
    "&Icirc;": "Î",
    "&#178;": "²",
    "&#240;": "ð",
    "&Iuml;": "Ï",
    "&#179;": "³",
    "&#241;": "ñ",
    "&ETH;": "Ð",
    "&#180;": "´",
    "&#242;": "ò",
    "&Ntilde;": "Ñ",
    "&#181;": "µ",
    "&#243;": "ó",
    "&Otilde;": "Õ",
    "&#182;": "¶",
    "&#244;": "ô",
    "&Ouml;": "Ö",
    "&#183;": "·",
    "&#245;": "õ",
    "&Oslash;": "Ø",
    "&#184;": "¸",
    "&#246;": "ö",
    "&Ugrave;": "Ù",
    "&#185;": "¹",
    "&#247;": "÷",
    "&Uacute;": "Ú",
    "&#186;": "º",
    "&#248;": "ø",
    "&Ucirc;": "Û",
    "&#187;": "»",
    "&#249;": "ù",
    "&Uuml;": "Ü",
    "&#64;": "@",
    "&#188;": "¼",
    "&#250;": "ú",
    "&Yacute;": "Ý",
    "&#189;": "½",
    "&#251;": "û",
    "&THORN;": "Þ",
    "&#128;": "€",
    "&#190;": "¾",
    "&#252": "ü",
    "&szlig;": "ß",
    "&#191;": "¿",
    "&#253;": "ý",
    "&agrave;": "à",
    "&#130;": "‚",
    "&#192;": "À",
    "&#254;": "þ",
    "&aacute;": "á",
    "&#131;": "ƒ",
    "&#193;": "Á",
    "&#255;": "ÿ",
    "&aring;": "å",
    "&#132;": "„",
    "&#194;": "Â",
    "&aelig;": "æ",
    "&#133;": "…",
    "&#195;": "Ã",
    "&ccedil;": "ç",
    "&#134;": "†",
    "&#196;": "Ä",
    "&egrave;": "è",
    "&#135;": "‡",
    "&#197;": "Å",
    "&eacute;": "é",
    "&#136;": "ˆ",
    "&#198;": "Æ",
    "&ecirc;": "ê",
    "&#137;": "‰",
    "&#199;": "Ç",
    "&euml;": "ë",
    "&#138;": "Š",
    "&#200;": "È",
    "&igrave;": "ì",
    "&#139;": "‹",
    "&#201;": "É",
    "&iacute;": "í",
    "&#140;": "Œ",
    "&#202;": "Ê",
    "&icirc;": "î",
    "&#203;": "Ë",
    "&iuml;": "ï",
    "&#142;": "Ž",
    "&#204;": "Ì",
    "&eth;": "ð",
    "&#205;": "Í",
    "&ntilde;": "ñ",
    "&#206;": "Î",
    "&ograve;": "ò",
    "&#145;": "‘",
    "&#207;": "Ï",
    "&oacute;": "ó",
    "&#146;": "’",
    "&#208;": "Ð",
    "&ocirc;": "ô",
    "&#147;": "“",
    "&#209;": "Ñ",
    "&otilde;": "õ",
    "&#148;": "”",
    "&#210;": "Ò",
    "&ouml;": "ö",
    "&#149;": "•",
    "&#211;": "Ó",
    "&oslash;": "ø",
    "&#150;": "–",
    "&#212;": "Ô",
    "&ugrave;": "ù",
    "&#151;": "—",
    "&#213;": "Õ",
    "&uacute;": "ú",
    "&#152;": "˜",
    "&#214;": "Ö",
    "&ucirc;": "û",
    "&#153;": "™",
    "&#215;": "×",
    "&yacute;": "ý",
    "&#154;": "š",
    "&#216;": "Ø",
    "&thorn;": "þ",
    "&#155;": "›",
    "&#217;": "Ù",
    "&yuml;": "ÿ",
    "&#156;": "œ",
    "&#218;": "Ú",
    "&mdash;": "—",
    "&middot;": "·",
  };

  // 使用正则表达式替换所有的HTML实体字符
  return str.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    // 如果实体字符存在于定义的对象中，则返回对应的字符，否则返回原字符
    return entities[entity] || entity;
  });
}

module.exports = {
  getLiText,
  decodedText,
  extractPhoneticAndAudio,
  getPText,
  clearText,
  toJSON,
  containChinese,
};
