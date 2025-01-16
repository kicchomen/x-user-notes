// interface User {
//   id: string,
//   memo: string,
//   tags: string,
//   latest: Profile,
//   history: Profile[],
//   version: string
// }

// interface Profile {
//   id: string,
//   name: string,
//   profile_image_url: string,
//   date: string,
//   version: string
// }

const Storage = {
  /**
   * @param {string} user_id 
   * @returns user
   */
  async getUser(user_id) {
    let key = `user:${user_id}`
    return await this.getJson(key)
  },
  /**
   * @param {User} user
   */
  setUser(user) {
    let key = `user:${user.id}`
    this.setJson(key, user)
  },
  /**
   * @param {User} user
   */
  removeUser(user) {
    let key = `user:${user.id}`
    chrome.storage.local.remove([key])
  },

  async getJson(key) {
    result = await chrome.storage.local.get([key])
    if (!result[key]) return
    return JSON.parse(result[key])
  },
  setJson(key, value) {
    let json = JSON.stringify(value)
    let obj = {}
    obj[key] = json
    chrome.storage.local.set(obj)
  },

  /**
   * ユーザ検索
   * @param {string} keyword 
   * @returns user[]
   */
  async search(keyword) {
    keyword = keyword || ''
    keyword = keyword.replace(/[\u3000\s]+/g, ' ')
    keyword = normalizeText(keyword)

    let results = await chrome.storage.local.get()
    results = Object.entries(results)

    if (keyword.trim()) {
      results = results.filter(([key, value]) => {
        const sanitized_text = normalizeText(value)
        return keyword.split(' ').every(word => {
          return sanitized_text.indexOf(word.trim()) !== -1
        })
      })
    }

    results = results.map(([key, value]) => JSON.parse(value))
    return results
  },
}

/**
 * 検索テキストをサニタイズ
 */
const normalizeText = function (text) {
  // 1個以上のスペースは1つの半角スペースに変換
  text = text.replace(/[\u3000\s]+/g, ' ')

  // 大文字を小文字に変換
  text = text.toLowerCase();

  // 全角英数を半角に変換
  text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });

  // 半角カタカナを全角に変換
  const halfWidthKana = {
    'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
    'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
    'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
    'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
    'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
    'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
    'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
    'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
    'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
    'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
    'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
    'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
    'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
    'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
    'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
    'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
    'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
    'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
    '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・'
  };

  text = text.replace(/[\uFF65-\uFF9F]/g, function(s) {
    return halfWidthKana[s] || s;
  });

  // カタカナをひらがなに変換
  text = text.replace(/[\u30A1-\u30F6]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0x60);
  });

  return text;
}
