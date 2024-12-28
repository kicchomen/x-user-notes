const ANNOTATION_BUTTON_CLASS = 'user-annotation-btn';

function createAnnotationButton(username) {
  const button = document.createElement('button');
  button.classList.add(ANNOTATION_BUTTON_CLASS);
  button.textContent = '📝';
  button.style.marginLeft = '5px';
  button.addEventListener('click', () => openAnnotationPopup(username));
  return button;
}

function openAnnotationPopup(username) {
  // 既存のポップアップを削除
  const existingPopup = document.querySelector('.user-annotation-popup');
  if (existingPopup) existingPopup.remove();

  // ポップアップ要素を作成
  const popup = document.createElement('div');
  popup.classList.add('user-annotation-popup');
  popup.innerHTML = `
    <div class="annotation-header">
      <h3>Annotation for @${username}</h3>
      <button class="close-btn">×</button>
    </div>
    <textarea id="annotation-text" placeholder="Enter your notes here..."></textarea>
    <button id="save-annotation">Save</button>
  `;

  // 既存のアノテーションをロード
  chrome.storage.local.get([username], (result) => {
    const annotationText = result[username] || '';
    popup.querySelector('#annotation-text').value = annotationText;
  });

  // 保存ボタンのイベントリスナー
  popup.querySelector('#save-annotation').addEventListener('click', () => {
    const text = popup.querySelector('#annotation-text').value;
    chrome.storage.local.set({[username]: text}, () => {
      alert('Annotation saved!');
    });
  });

  // 閉じるボタンのイベントリスナー
  popup.querySelector('.close-btn').addEventListener('click', () => {
    popup.remove();
  });

  document.body.appendChild(popup);
}

function injectAnnotationButtons() {
  // プロフィール、フォロー一覧、投稿一覧の各ユーザー名に対してボタンを追加
  const usernameSelectorPatterns = [
    'a[href^="/"][dir="ltr"]:not(.user-annotation-processed)',
    // 追加の選択子を必要に応じて追加
  ];

  usernameSelectorPatterns.forEach(selector => {
    const userLinks = document.querySelectorAll(selector);
    userLinks.forEach(link => {
      const username = link.textContent.replace('@', '').trim();
      const annotationButton = createAnnotationButton(username);
      link.parentNode.insertBefore(annotationButton, link.nextSibling);
      link.classList.add('user-annotation-processed');
    });
  });
}

// ページ変更を検出し、定期的にボタンを再挿入
function observePageChanges() {
  const observer = new MutationObserver(() => {
    injectAnnotationButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 初期化
function init() {
  injectAnnotationButtons();
  observePageChanges();
}

init();