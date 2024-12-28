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
        Storage.setUser({
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
        })
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
  popup.classList.add('user-annotation-popup');
  popup.innerHTML = `
    <div class="annotation-header">
      <h3>Annotation for @${user.latest.name}</h3>
      <button class="close-btn">×</button>
    </div>
    <textarea id="annotation-text" placeholder="Enter your notes here..."></textarea>
    <button id="save-annotation">Save</button>
  `;

  // 既存のアノテーションをロード
  popup.querySelector('#annotation-text').value = user.memo;

  // 保存ボタンのイベントリスナー
  popup.querySelector('#save-annotation').addEventListener('click', () => {
    const text = popup.querySelector('#annotation-text').value;
    Storage.setUser({...user, memo: text});
  });

  // 閉じるボタンのイベントリスナー
  popup.querySelector('.close-btn').addEventListener('click', () => {
    popup.remove();
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