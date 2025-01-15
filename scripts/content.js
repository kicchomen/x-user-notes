// TODO: フレームワーク適用（https://github.com/antfu-collective/vitesse-webext）


function injectAnnotationButtons() {
  // プロフィール、フォロー一覧、投稿一覧の各ユーザー名に対してボタンを追加
  const articleSelectorPatterns = [
    ARTICLE_SELECTOR,
    USER_SELECTOR,
    // 追加の選択子を必要に応じて追加
  ];

  // おすすめタブでは実行しない
  if (Extractor.isRecommendTab()) return

  // 処理済みのコンポーネントに付与するクラス名
  const PROCESSED_CLASS = 'processed'
  articleSelectorPatterns.forEach(selector => {
    const articles = document.querySelectorAll(selector);
    articles.forEach(async article => {
      // すでに処理済みのコンポーネントはスキップ
      if (article.classList.contains(PROCESSED_CLASS)) return


      // 広告やリツイートはスキップ
      if (Extractor.isAd(article)) return
      if (Extractor.isRepost(article)) return

      const userid = Extractor.extractUserID(article)
      let user = await Storage.getUser(userid)

      const name = Extractor.extractUserName(article)
      const image = Extractor.extractUserImage(article)

      // ユーザデータ未作成の場合は作成
      if (!user) {
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
        user = updated_user
      }

      // 更新があるユーザのデータ更新
      if (user.latest.name != name || user.latest.profile_image_url != image) {
        user.history.push(user.latest)
        user.latest = {
          id: userid,
          name: name,
          profile_image_url: image,
          date: new Date().toISOString(),
          version: SYSTEM_VERSION
        }
        Storage.setUser(user)
      }

      // ボタン挿入
      Injector.inject(article, user, () => {
        ScribbleModalView.renderMain(user.id)
      })

      article.classList.add(PROCESSED_CLASS);
    });
  });
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