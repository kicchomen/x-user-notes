// TODO: フレームワーク適用（https://github.com/antfu-collective/vitesse-webext）


function injectAnnotationButtons() {
  // プロフィール、フォロー一覧、投稿一覧の各ユーザー名に対してボタンを追加
  const articleSelectorPatterns = [
    ARTICLE_SELECTOR,
    USER_SELECTOR,
    // 追加の選択子を必要に応じて追加
  ];

  // 処理済みのコンポーネントに付与するクラス名
  const PROCESSED_CLASS = 'processed'
  articleSelectorPatterns.forEach(selector => {
    const articles = document.querySelectorAll(selector);
    articles.forEach(async article => {
      // すでに処理済みのコンポーネントはスキップ
      if (article.classList.contains(PROCESSED_CLASS)) return

      const userid = Extractor.extractUserID(article)
      Injector.inject(article, userid, openAnnotationPopup)
      
      // ユーザデータ未作成の場合は作成
      user = await Storage.getUser(userid)
      if (!user) {
        const name = Extractor.extractUserName(article)
        const image = Extractor.extractUserImage(article)
        const updated_user = {
          id: userid,
          memo: '',
          tags: '',
          latest: {
            id: userid,
            name: name,
            profile_image_url: image,
            date: new Date().toISOString(),
            version: SYSTEM_VERSION
          },
          history: [],
          version: SYSTEM_VERSION
        }
        Storage.setUser(updated_user)
      }

      // TODO: 更新があるユーザのデータ更新

      article.classList.add(PROCESSED_CLASS);
    });
  });
}

async function openAnnotationPopup(user_id) {
  // 既存のポップアップを削除
  const existingPopup = document.querySelector('.user-annotation-popup');
  if (existingPopup) existingPopup.remove();

  const user = await Storage.getUser(user_id)
  
  // ポップアップ要素を作成
  const popup = document.createElement('div');
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
            <p class="name">ユーザ名: ${user.latest.name}</p>
          </div>
        </div>
        <div class="annotation">
          <div class="memo">
            <textarea id="annotation-text" placeholder="ここはメモ欄です。フォローしたきっかけや、過去にどんな絡みをしたかなど、好きに記述してみてください。" rows="3"></textarea>
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

// ページ変更を検出し、定期的にボタンを再挿入
function observePageChanges() {
  let timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      injectAnnotationButtons();
    }, 300); // 300ms のデバウンス
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 初期化
function init() {
  // injectAnnotationButtons();
  observePageChanges();
}

init();