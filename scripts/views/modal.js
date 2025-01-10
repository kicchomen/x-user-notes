const ScribbleModalView = {
  // ポップアップのルート要素
  root: null,

  renderMain: async function (user) {
    // 既存のポップアップを削除
    const existingPopup = document.querySelector('.user-annotation-popup');
    if (existingPopup) existingPopup.remove();
    
    // ポップアップ要素を作成
    const popup = document.createElement('div');
    this.root = popup;
    popup.classList.add('overlay');
    const icon_url = chrome.runtime.getURL("assets/logo.png");
    popup.innerHTML = `
      <div class="user-annotation-popup">
        <div class="annotation-header">
          <h3><img src="${icon_url}">X Followees Scribble</h3>
          <button class="close-btn">×</button>
        </div>
        <div class="annotation-body">
          <div class="user-info">
            <img src="${user.latest.profile_image_url}" alt="User Image">
            <div>
              <p class="id">@${user.id}</p>
              <a class="resync-id-btn">→ ユーザ ID が変わったかも？</a>
              <p class="name">${user.latest.name}</p>
            </div>
          </div>
          <div class="annotation">
            <div class="memo">
              <textarea id="annotation-text" placeholder="ここはメモ欄です。ユーザの特徴、フォローしたきっかけや、過去にどんな絡みをしたかなど、好きに記述してみてください。" rows="3"></textarea>
            </div>
            <div class="tags">
              <input id="annotation-tags" type="text" placeholder="タグをつける">
            </div>
          </div>
  
          <a class="history-btn">過去の情報を見る</a>
  
        </div>
      </div>
    `;
  
    // 既存のアノテーションをロード
    popup.querySelector('#annotation-text').value = user.memo;
    popup.querySelector('#annotation-tags').value = user.tags;
  
    // 編集時のイベントリスナー
    const save = () => {
      // TODO: 保存した旨のメッセージを表示（差分確認する？）
      const memo = popup.querySelector('#annotation-text').value;
      const tags = popup.querySelector('#annotation-tags').value;
      Storage.setUser({...user, memo: memo,tags: tags});
    }

    popup.querySelector('#annotation-text').addEventListener('blur', save);
    popup.querySelector('#annotation-tags').addEventListener('blur', save);
  
    // 閉じるボタンのイベントリスナー
    popup.querySelector('.close-btn').addEventListener('click', () => {
      popup.remove();
    });
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.remove();
    });
  
    document.body.appendChild(popup);
  }
}