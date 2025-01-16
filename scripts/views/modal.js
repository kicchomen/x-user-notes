const ScribbleModalView = {
  // ポップアップのルート要素
  root: null,
  // 現在対象のユーザオブジェクト
  user: null,

  renderMain: async function (user_id) {
    this.user = await Storage.getUser(user_id);

    // 既存のポップアップを削除
    const existingPopup = document.querySelector('.overlay');
    if (existingPopup) existingPopup.remove();
    
    // ポップアップ要素を作成
    const popup = document.createElement('div');
    this.root = popup;
    popup.classList.add('overlay');
    const icon_url = chrome.runtime.getURL("assets/logo.png");
    popup.innerHTML = `
      <div class="user-annotation-popup">
        <div class="annotation-header">
          <div class="title">
            <h3><img src="${icon_url}">X Followees Scribble</h3>
            <button class="close-btn">×</button>
          </div>

          <div class="user-info">
            <img src="${this.user.latest.profile_image_url}" alt="User Image">
            <div>
              <p class="id">@${this.user.id}</p>
              <a class="resync-id-btn">→ ユーザ ID が変わったかも？</a>
              <a class="detach-id-btn">→ 紐付けを間違えたかも？</a>
              <p class="name">${this.user.latest.name}</p>
            </div>
          </div>
        </div>
        <div class="annotation-body">
          <div class="annotation">
            <div class="memo">
              <textarea id="annotation-text" placeholder="ここはメモ欄です。ユーザの特徴、フォローしたきっかけや、過去にどんなやり取りをしたかなど、自由に記述してみてください。" rows="3"></textarea>
            </div>
            <div class="tags">
              <div id="tags-container"></div>
              <input id="annotation-tags" type="text" placeholder="タグをつけるとタイムライン上で視認することができます">
            </div>
          </div>
  
          <button class="history-btn">過去の情報を見る</button>
  
        </div>
      </div>
    `;

    // TODO: ここごちゃごちゃしすぎ
    if (this.user.history.length == 0) {
      // 過去の情報を見るボタンの非活性化
      popup.querySelector('.history-btn').disabled = true

      popup.querySelector('.detach-id-btn')?.remove()
    } else {
      // 履歴に id が異なるデータがある場合、間違えて紐づけてしまった場合に切り戻せるように
      const has_id_gap = this.user.history.some(u => {
        return u.id != this.user.id
      })
      if (!has_id_gap) {
        popup.querySelector('.detach-id-btn')?.remove()
      } else {
        popup.querySelector('.detach-id-btn')?.addEventListener('click', e => {
          this.renderHistory()
        })
      }
    }

    // 既存のアノテーションをロード
    popup.querySelector('#annotation-text').value = this.user.memo;
    this.loadTags(this.user.tags);

    // タグ更新時のイベントハンドラ
    const changeTagHandler = (e) => {
      if (!e.target.value) return

      e.preventDefault();
      this.addTag(e.target.value);
      e.target.value = '';
      this.saveScribble();
    }

    popup.querySelector('#annotation-text').addEventListener('blur', this.saveScribble.bind(this));
    popup.querySelector('#annotation-tags').addEventListener('blur', changeTagHandler);
    popup.querySelector('#annotation-tags').addEventListener('keypress', (e) => {
      if (e.key !== 'Enter') return
      changeTagHandler(e)
    });
  
    // 閉じるボタンのイベントリスナー
    popup.querySelector('.close-btn').addEventListener('click', () => {
      popup.remove();
    });
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.remove();
    });

    // 履歴ボタンのイベントリスナー
    popup.querySelector('.history-btn').addEventListener('click', () => {
      // 非活性状態なら無視
      if (popup.querySelector('.history-btn').disabled) return

      this.renderHistory();
    });

    // ユーザ検索ボタンのイベントリスナー
    popup.querySelector('.resync-id-btn').addEventListener('click', () => {
      this.renderUserSearch();
    });
  
    document.body.appendChild(popup);
  },

  loadTags: function(tags) {
    const tagsContainer = this.root.querySelector('#tags-container');
    tagsContainer.innerHTML = '';
    tags.split(',').forEach(tag => this.addTag(tag));
  },

  addTag: function(tag) {
    if (tag === '') return;

    const tagsContainer = this.root.querySelector('#tags-container');
    const tagElement = document.createElement('span');
    tagElement.classList.add('tag');
    tagElement.textContent = tag;
    const removeBtn = document.createElement('a');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      tagElement.remove();
      this.saveScribble();
    });
    tagElement.appendChild(removeBtn);
    tagsContainer.appendChild(tagElement);
  },

  saveScribble: function() {
    const tags = Array.from(this.root.querySelectorAll('.tag')).map(tag => tag.textContent.replace('×', '')).join(',');
    const memo = this.root.querySelector('#annotation-text').value;

    // 差分がなければ保存しない
    if (this.user.memo == memo && this.user.tags == tags) return

    this.user = { ...this.user, memo: memo, tags: tags }
    Storage.setUser(this.user);

    this.Message.info('saved')

    // タイムライン側に反映
    updateUserOnTimeline(this.user)
  },

  renderHistory: async function () {
    this.root.querySelector('.annotation-body').innerHTML = `
      <div class="scrollable-wrapper">
        <div class="history scrollable">
        </div>
      </div>

      <a class="back-btn">戻る</a>
    `

    // 戻るボタンのイベントリスナー
    this.root.querySelector('.back-btn').addEventListener('click', () => {
      this.renderMain(this.user.id);
    });

    // const SAMPLE_HISTORY = [
    //   { date: new Date('2025-01-10'), id: 'userid', name: 'ユーザ名', profile_image_url: 'https://pbs.twimg.com/profile_images/1733772876392869888/ved_zHcx_x96.jpg' },
    //   { date: new Date('2025-01-09'), id: 'userid', name: 'ユーザ名', profile_image_url: 'https://pbs.twimg.com/profile_images/1733772876392869888/ved_zHcx_x96.jpg' },
    //   { date: new Date('2025-01-01'), id: 'userid', name: 'ユーザ名', profile_image_url: 'https://pbs.twimg.com/profile_images/1733772876392869888/ved_zHcx_x96.jpg' },
    //   { date: new Date('2024-10-01'), id: 'userid', name: 'ユーザ名', profile_image_url: 'https://pbs.twimg.com/profile_images/1733772876392869888/ved_zHcx_x96.jpg' },
    //   { date: new Date('2023-12-01'), id: 'userid', name: 'ユーザ名', profile_image_url: 'https://pbs.twimg.com/profile_images/1733772876392869888/ved_zHcx_x96.jpg' },
    //   { date: new Date('2023-01-01'), id: 'userid', name: 'ユーザ名', profile_image_url: 'https://pbs.twimg.com/profile_images/1733772876392869888/ved_zHcx_x96.jpg' }
    // ]
    // SAMPLE_HISTORY.forEach(history => {
    this.user.history.slice().reverse().forEach(history => {
      const historyElm = document.createElement('div')
      historyElm.classList.add('history-item')
      historyElm.innerHTML = `
        <p class="date">
          <span>${timeAgo(history.date)}</span>
        </p>
        <div class="user-info">
          <img src="${history.profile_image_url}" alt="User Image">
          <div>
            <p class="id">@${history.id}</p>
            <p class="name">${history.name}</p>
          </div>
        </div>
      `

      // 今と ID が異なる場合、紐付けを解除するボタンを設定
      if (history.id != this.user.id) {
        const btnElm = document.createElement('a')
        btnElm.classList.add('detach-id-btn')
        btnElm.innerText = '別人のためユーザを切り離す'
        btnElm.addEventListener('click', async e => {
          const index = this.user.history.indexOf(history)
          this.unlinkUser(index)
          this.renderHistory()
          this.Message.info('データを切り離しました')
        })
        historyElm.querySelector('.user-info')?.appendChild(btnElm)
      }

      this.root.querySelector('.history').appendChild(historyElm)
    })
  },

  renderUserSearch: async function () {
    this.root.querySelector('.annotation-body').innerHTML = `
      <p class="step">キーワードで絞り込んで、変更前と思われるユーザ ID を選択してください</p>
      <input id="user-search-filter-input" type="text" placeholder="キーワードでユーザ絞り込み">
      <div class="scrollable-wrapper">
        <div class="user-search scrollable">
        </div>
      </div>

      <a class="back-btn">戻る</a>
    `

    // 戻るボタンのイベントリスナー
    this.root.querySelector('.back-btn').addEventListener('click', () => {
      this.renderMain(this.user.id);
    });

    // 絞り込みフォームのリスナー
    document.querySelector('#user-search-filter-input')?.addEventListener('change', async (e) => {
      const results = await Storage.search(e.target.value)
      this.drawResults(results)
    })

    const results = await Storage.search()
    this.drawResults(results)
  },

  /**
   * ユーザ検索結果の描画処理
   * renderUserSearch からのみ呼ばれる想定
   * @param {Array} results ユーザリスト（Storage.search の返り値）
   */
  drawResults: function (results) {
    // 検索結果の最大表示件数
    const MAX_RESULTS = 30

    this.root.querySelector('.user-search').innerHTML = ''
    results.slice(0, MAX_RESULTS).forEach(u => {
      const userElm = document.createElement('div')
      userElm.classList.add('user-item')
      userElm.innerHTML = `
        <div class="user-info">
          <img src="${u.latest.profile_image_url}" alt="User Image">
          <div>
            <p class="id">@${u.id}</p>
            <p class="name">${u.latest.name}</p>
          </div>
        </div>
      `
      this.root.querySelector('.user-search').appendChild(userElm)
      userElm.addEventListener('click', async () => {
        this.linkUser(u)
        await this.renderMain(this.user.id);
        this.Message.info('選択したユーザ情報と紐付けました')
      })
    })

    // 補足メッセージ
    this.root.querySelector('.user-search > p')?.remove()
    if (results.length > MAX_RESULTS) {
      const p_elm = document.createElement('p')
      p_elm.innerText = '検索結果が多いため省略しています'
      this.root.querySelector('.user-search').appendChild(p_elm)
    }
  },

  /**
   * src user を dst user に紐付ける。
   * 具体的には、src user 情報を dst user の history にぶっ込んで
   * src user は削除。
   * @param {*} src_user 
   */
  linkUser: function (src_user) {
    const dst_user = this.user
    src_user.latest.memo = src_user.memo
    src_user.latest.tags = src_user.tags
    src_user.history.push(src_user.latest)
    dst_user.history = src_user.history.concat(dst_user.history)

    Storage.setUser(dst_user)
    Storage.removeUser(src_user)
  },

  /**
   * ユーザ紐付けを解除。
   * 指定した履歴データ以降を切り離す
   * @param {Number} history_index user.history で対象となる index
   */
  unlinkUser: function (history_index) {
    if (this.user.history.length == 0) return
    if (history_index >= this.user.history.length) return

    // TODO: ユーザ管理系のモジュールで管理したい
    this.user.history[history_index]
    const recovery_user_history = this.user.history.splice(0, history_index+1)
    const recovery_user_latest = recovery_user_history.pop()
    
    const recovery_user = {
      id: recovery_user_latest.id,
      memo: recovery_user_latest.memo || '',
      tags: recovery_user_latest.tags || '',
      latest: recovery_user_latest,
      history: recovery_user_history,
      version: SYSTEM_VERSION
    }

    Storage.setUser(this.user)
    Storage.setUser(recovery_user)
  },

  Message: {
    AUTO_CLOSE_TIME_MS: 1500,

    info: (text) => {
      // モーダルの存在確認
      if (!ScribbleModalView.root) return

      // メッセージの重複対策
      const already_message = ScribbleModalView.root.querySelector('.message')
      if (already_message) already_message.remove()

      const message_elm = document.createElement('div')
      message_elm.classList.add('message')
      message_elm.innerText = text
      setTimeout(()=>{
        if (message_elm) message_elm.remove()
      }, ScribbleModalView.Message.AUTO_CLOSE_TIME_MS)

      ScribbleModalView.root.querySelector('.user-annotation-popup').appendChild(message_elm)
    }
  }
}


/**
 * 特定のユーザに関して、タイムライン上の Scribble 要素を更新
 * @param {*} user 
 */
const updateUserOnTimeline = (user) => {
  document.querySelectorAll('.processed').forEach((elm) => {
    const userid = Extractor.extractUserID(elm)
    if (user.id != userid) return

    elm.classList.remove('processed');
    elm.querySelector('.follow-notes-area')?.remove()
  })
}


const timeAgo = function(date) {
  const now = new Date();
  const created_at = new Date(date)
  const seconds = Math.floor((now - created_at) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) return interval + " 年前";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " ヶ月前";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " 日前";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " 時間前";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " 分前";
  return Math.floor(seconds) + " 秒前";
}
