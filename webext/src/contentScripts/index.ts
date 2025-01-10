/* eslint-disable no-console */
import { onMessage } from 'webext-bridge/content-script'
import { createApp } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import App from './views/App.vue'
import { setupApp } from '~/logic/common-setup'
import { ARTICLE_SELECTOR_PATTERNS } from '~/env'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  // communication example: send previous tab title from background page
  onMessage('tab-prev', ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
  })

  const init = () => {
    observePageChange();
  }

  const observePageChange = () => {
    const observer = new MutationObserver(debouncedInjectApps);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * プロフィール、フォロー一覧、投稿一覧の各ユーザー名に対してボタンを追加
   */
  const injectApps = () => {
    // 処理済みのコンポーネントに付与するクラス名
    const PROCESSED_CLASS = 'processed'

    ARTICLE_SELECTOR_PATTERNS.forEach(selector => {
      const articles = document.querySelectorAll(selector);
      articles.forEach(async article => {
        // すでに処理済みのコンポーネントはスキップ
        if (article.classList.contains(PROCESSED_CLASS)) return
        article.classList.add(PROCESSED_CLASS);

        // 念のため、すでにコンポーネントが存在する場合はスキップ
        if (article.querySelector(`.${__NAME__}`)) return

        // 独自領域 DOM を生成して Vue アプリケーションをマウント
        const { container, root } = createScribbleDOM()
        article.insertBefore(container, article.firstChild);
        const app = createApp(App);
        setupApp(app)
        app.mount(root)
      });
    });
  }
  // デバウンスを 400 ms で設定
  const debouncedInjectApps = useDebounceFn(injectApps, 400)

  /**
   * 当拡張機能の領域要素を生成
   * @returns {HTMLElement} container - 拡張機能の領域要素
   * @returns {HTMLElement} root - Vue アプリケーションをマウントするルート要素
   */
  const createScribbleDOM = () => {
    const container = document.createElement('div')
    container.classList.add(__NAME__)
    const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container

    // 拡張機能のスタイルシートを読み込む
    const styleEl = document.createElement('link')
    styleEl.setAttribute('rel', 'stylesheet')
    styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
    shadowDOM.appendChild(styleEl)

    const root = document.createElement('div')
    shadowDOM.appendChild(root)
    return { container, root }
  }

  init()
})()
