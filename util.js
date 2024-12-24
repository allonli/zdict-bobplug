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
function getLiText(htmlContent) {
  // 定义正则表达式，用于匹配具有特定class的<div>标签及其内部内容
  const regex = /<div class="content definitions jnr"[^>]*>([\s\S]*?)<\/div>/;
  // 使用正则表达式匹配HTML内容
  const match = htmlContent.match(regex);

  var arr = [];
  // 如果单字匹配成功
  if (match) {
    // 获取匹配到的<div>标签内部的内容
    const divContent = match[1];
    // 定义正则表达式，用于匹配<div>标签内部的所有<li>标签及其内部内容
    const liRegex = /<li>([\s\S]*?)<\/li>/g;
    // 初始化变量，用于存储每次匹配的结果
    let liMatch;
    let count = 0;
    // 使用正则表达式循环匹配<div>标签内部的<li>标签
    while ((liMatch = liRegex.exec(divContent)) !== null) {
      // 获取匹配到的<li>标签内部的内容，并去除其中的HTML标签
      const liContent = liMatch[1].replace(/<[^>]+>/g, "");
      let decodeText = decodedText(++count + ". " + liContent);
      arr.push(decodeText);
    }

    const pair = extractPhoneticAndAudio(htmlContent);

    const r = {
      result: {
        toDict: {
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
        toParagraphs: arr,
      },
    };

    return r;
  }
}

function getPText(htmlContent) {
  // 正则表达式匹配<div class="jnr">内的所有<p>标签内容
  const regex = /<div class="jnr">[\s\S]*?<\/div>/g;
  const matches = decodedText(htmlContent).match(regex);

  var arr = [];
  if (matches) {
    // 遍历匹配结果
    matches.forEach((match) => {
      // 检查是否包含<p>标签，没有直接输出，有则提取<p>标签内容
      if (!/<p>/.test(match)) {
        arr.push(clearText(matches[0]));
      } else {
        // 正则表达式匹配每个<p>标签内容
        const pRegex = /<p>([\s\S]*?)<\/p>/g;
        let pMatch;
        while ((pMatch = pRegex.exec(match)) !== null) {
          arr.push(clearText(pMatch[1]));
        }
      }
    });
  }

  const r = {
    result: {
      toDict: {
        additions: [{ name: "详细解释", value: "--" }],
      },
      toParagraphs: arr,
    },
  };

  return r;
}
// 去掉这种的垃圾 [ask;request;beg;demand;seek] ∶
// 去掉各种标签
function clearText(str) {
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
    "&ordf;": "ª",
    "&laquo;": "«",
    "&not;": "¬",
    "&shy;": "­",
    "&reg;": "®",
    "&macr;": "¯",
    "&deg;": "°",
    "&plusmn;": "±",
    "&sup2;": "²",
    "&sup3;": "³",
    "&acute;": "´",
    "&micro;": "µ",
    "&para;": "¶",
    "&middot;": "·",
    "&cedil;": "¸",
    "&sup1;": "¹",
    "&ordm;": "º",
    "&raquo;": "»",
    "&frac14;": "¼",
    "&frac12;": "½",
    "&frac34;": "¾",
    "&iquest;": "¿",
    "&Agrave;": "À",
    "&Aacute;": "Á",
    "&Acirc;": "Â",
    "&Atilde;": "Ã",
    "&Auml;": "Ä",
    "&Aring;": "Å",
    "&AElig;": "Æ",
    "&Ccedil;": "Ç",
    "&Egrave;": "È",
    "&Eacute;": "É",
    "&Ecirc;": "Ê",
    "&Euml;": "Ë",
    "&Igrave;": "Ì",
    "&Iacute;": "Í",
    "&Icirc;": "Î",
    "&Iuml;": "Ï",
    "&ETH;": "Ð",
    "&Ntilde;": "Ñ",
    "&Ograve;": "Ò",
    "&Oacute;": "Ó",
    "&Ocirc;": "Ô",
    "&Otilde;": "Õ",
    "&Ouml;": "Ö",
    "&times;": "×",
    "&Oslash;": "Ø",
    "&Ugrave;": "Ù",
    "&Uacute;": "Ú",
    "&Ucirc;": "Û",
    "&Uuml;": "Ü",
    "&Yacute;": "Ý",
    "&THORN;": "Þ",
    "&szlig;": "ß",
    "&agrave;": "à",
    "&aacute;": "á",
    "&acirc;": "â",
    "&atilde;": "ã",
    "&auml;": "ä",
    "&aring;": "å",
    "&aelig;": "æ",
    "&ccedil;": "ç",
    "&egrave;": "è",
    "&eacute;": "é",
    "&ecirc;": "ê",
    "&euml;": "ë",
    "&igrave;": "ì",
    "&iacute;": "í",
    "&icirc;": "î",
    "&iuml;": "ï",
    "&eth;": "ð",
    "&ntilde;": "ñ",
    "&ograve;": "ò",
    "&oacute;": "ó",
    "&ocirc;": "ô",
    "&otilde;": "õ",
    "&ouml;": "ö",
    "&divide;": "÷",
    "&oslash;": "ø",
    "&ugrave;": "ù",
    "&uacute;": "ú",
    "&ucirc;": "û",
    "&uuml;": "ü",
    "&yacute;": "ý",
    "&thorn;": "þ",
    "&yuml;": "ÿ",
    // 你可以根据需要继续添加更多的HTML实体
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
};
