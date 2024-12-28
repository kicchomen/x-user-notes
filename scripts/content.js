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
    articles.forEach(article => {
      // すでに処理済みのコンポーネントはスキップ
      if (article.classList.contains(PROCESSED_CLASS)) return

      const userid = Extractor.extractUserID(article)
      Injector.inject(article, userid)

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