const ScribbleModalView = {
  // ポップアップのルート要素
  root: null,
  // 現在対象のユーザオブジェクト
  user: null,

  renderMain: async function (user_id) {
    const _ = chrome.i18n.getMessage
    this.user = await Storage.getUser(user_id);

    // 既存のポップアップを削除
    const existingPopup = document.querySelector('.overlay');
    if (existingPopup) existingPopup.remove();
    
    // ポップアップ要素を作成
    const popup = document.createElement('div');
    this.root = popup;
    popup.classList.add('overlay');
    const icon_url = chrome.runtime.getURL("assets/icon.png");
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
              <a class="resync-id-btn">→ ${_("userIdChanged")}</a>
              <div class="help-btn">
                <i>i</i>
                <div class="tooltips">
                  ${_("userLinkHelp")}
                </div>
              </div>
              <a class="detach-id-btn">→ ${_("userLinkIncorrect")}</a>
              <p class="name">${this.user.latest.name}</p>
            </div>
          </div>
        </div>
        <div class="annotation-body">
          <div class="annotation">
            <div class="memo">
              <textarea id="annotation-text" placeholder="${_("placeholderMemo")}" rows="4"></textarea>
            </div>
            <div class="tags">
              <div id="tags-container"></div>
              <input id="annotation-tags" type="text" placeholder="${_("placeholderTags")}">
            </div>
          </div>
  
          <button class="history-btn">${_("historyLink")}</button>
  
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

  renderHistory: function () {
    if (!this.root) return
    const _ = chrome.i18n.getMessage

    this.root.querySelector('.annotation-body').innerHTML = `
      <div class="scrollable-wrapper">
        <div class="history scrollable">
        </div>
      </div>

      <a class="back-btn">${_("back")}</a>
    `

    // 戻るボタンのイベントリスナー
    this.root.querySelector('.back-btn').addEventListener('click', () => {
      this.renderMain(this.user.id);
    });

    // ユーザID が異なるユーザ履歴データに、ボタンを付与するため、比較用変数
    let prev_user_id = this.user.id
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
      if (history.id != prev_user_id) {
        prev_user_id = history.id

        const btnElm = document.createElement('a')
        btnElm.classList.add('detach-id-btn')
        btnElm.innerText = _("detachUser")
        btnElm.addEventListener('click', async e => {
          const index = this.user.history.indexOf(history)
          this.unlinkUser(index)
          this.renderHistory()
          this.Message.info(_("detachedUser"))
        })
        historyElm.querySelector('.user-info')?.appendChild(btnElm)
      }

      this.root.querySelector('.history').appendChild(historyElm)
    })
  },

  renderUserSearch: async function () {
    const _ = chrome.i18n.getMessage
    this.root.querySelector('.annotation-body').innerHTML = `
      <p class="step">${_("attachUserStep")}</p>
      <input id="user-search-filter-input" type="text" placeholder="${_("placeholderFilterUser")}">
      <div class="scrollable-wrapper">
        <div class="user-search scrollable">
        </div>
      </div>

      <a class="back-btn">${_("back")}</a>
    `

    // 戻るボタンのイベントリスナー
    this.root.querySelector('.back-btn').addEventListener('click', () => {
      this.renderMain(this.user.id);
    });

    // 絞り込みフォームのリスナー
    document.querySelector('#user-search-filter-input')?.addEventListener('change', async (e) => {
      const results = await Storage.searchUser(e.target.value)
      this.drawResults(results)
    })

    const results = await Storage.searchUser()
    this.drawResults(results)
  },

  /**
   * ユーザ検索結果の描画処理
   * renderUserSearch からのみ呼ばれる想定
   * @param {Array} results ユーザリスト（Storage.searchUser の返り値）
   */
  drawResults: function (results) {
    if (!this.root) return
    const _ = chrome.i18n.getMessage

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
        this.Message.info(_("attachedUser"))
      })
    })

    // 補足メッセージ
    this.root.querySelector('.user-search > p')?.remove()
    if (results.length > MAX_RESULTS) {
      const p_elm = document.createElement('p')
      p_elm.innerText = _("omitResults")
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
  const _ = chrome.i18n.getMessage
  const now = new Date();
  const created_at = new Date(date)
  const seconds = Math.floor((now - created_at) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) return _("dateBeforeYear").replace("%s", interval)
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return _("dateBeforeMonth").replace("%s", interval);
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return _("dateBeforeDay").replace("%s", interval);
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return _("dateBeforeHour").replace("%s", interval);
  interval = Math.floor(seconds / 60);
  if (interval > 1) return _("dateBeforeMinute").replace("%s", interval);
  return _("dateBeforeSecond").replace("%s", interval);
}
