const ANNOTATION_BUTTON_CLASS = 'user-annotation-btn';

function createAnnotationButton(userId) {
  const button = document.createElement('button');
  button.classList.add(ANNOTATION_BUTTON_CLASS);
  button.textContent = '📝';
  button.style.marginLeft = '5px';
  button.addEventListener('click', () => openAnnotationPopup(userId));
  return button;
}

function openAnnotationPopup(userId) {
  // 既存のポップアップを削除
  const existingPopup = document.querySelector('.user-annotation-popup');
  if (existingPopup) existingPopup.remove();

  // ポップアップ要素を作成
  const popup = document.createElement('div');
  popup.classList.add('user-annotation-popup');
  popup.innerHTML = `
    <div class="annotation-header">
      <h3>Annotation for User @${userId}</h3>
      <button class="close-btn">×</button>
    </div>
    <textarea id="annotation-text" placeholder="Enter your notes here..."></textarea>
    <button id="save-annotation">Save</button>
  `;

  // 既存のアノテーションをロード
  chrome.storage.local.get([userId], (result) => {
    const annotationText = result[userId] || '';
    popup.querySelector('#annotation-text').value = annotationText;
  });

  // 保存ボタンのイベントリスナー
  popup.querySelector('#save-annotation').addEventListener('click', () => {
    const text = popup.querySelector('#annotation-text').value;
    chrome.storage.local.set({[userId]: text}, () => {
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
  // ユーザーリンクに対してボタンを追加
  const userLinkSelector = 'a[href^="/user/"]';
  const userLinks = document.querySelectorAll(userLinkSelector);
  userLinks.forEach(link => {
    const userId = link.getAttribute('href').split('/')[2];
    const annotationButton = createAnnotationButton(userId);
    link.parentNode.insertBefore(annotationButton, link.nextSibling);
  });
}

function observePageChanges() {
  const observer = new MutationObserver(() => {
    injectAnnotationButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function init() {
  injectAnnotationButtons();
  observePageChanges();
}

init();