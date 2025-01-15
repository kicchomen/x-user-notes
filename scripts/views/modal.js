// TODO: ユーザIDが変わった？機能
//　　過去の情報を見るボタンが押せないとき、ヒントとして表示するのが直感的でわかりやすいかも
// TODO: 履歴ページの実データ利用


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

    // 過去の情報を見るボタンの非活性化
    if (this.user.history.length == 0) {
      popup.querySelector('.history-btn').disabled = true
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
  },

  renderHistory: async function () {
    this.root.querySelector('.annotation-body').innerHTML = `
      <div class="history scrollable">
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
    this.user.history.reverse().forEach(history => {
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
      this.root.querySelector('.history').appendChild(historyElm)
    })
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
