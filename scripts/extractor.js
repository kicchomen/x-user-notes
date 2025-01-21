const Extractor = {
  extractUserID(article) {
    return article.querySelector('[data-testid*="UserAvatar-Container-"] a').href.split('/').pop()
  },
  extractUserImage(article) {
    let url

    // タイムライン
    let img_elm = article.querySelector('[data-testid="Tweet-User-Avatar"] img')
    if (img_elm) url = img_elm.src

    // フォロー一覧
    img_elm = article.lastChild.firstChild.querySelector('img')
    if (img_elm) url = img_elm.src

    // 利用ディスプレイによって画像サイズ（URL）が変わるのでその対策
    url = url.replace("normal.", "200x200.").replace("x96.", "200x200.").replace("400x400.", "200x200.")
    return url
  },
  extractUserName(article) {
    // タイムライン
    const name_elm = article.querySelector('[data-testid="User-Name"] a')
    if (name_elm) return name_elm.textContent

    // フォロー一覧
    const userid = this.extractUserID(article)
    return article.lastChild.textContent.split(`@${userid}`).shift()
  },
  extractAll(article) {
    this.extractUserID(article)
    this.extractUserName(article)
    this.extractUserImage(article)
  },

  isAd(article) {
    return !!article.parentElement.parentElement.querySelector('[data-testid=placementTracking]')
  },
  isRepost(article) {
    return !!article.querySelector('[data-testid="socialContext"]')
  },

  // ページ全般の情報取得系
  isRecommendTab() {
    // 日本語、英語のみ対応
    const RECOMMEND_TAB_NAMES = ['For you', 'おすすめ']

    const currentTab = document.querySelector('[data-testid="ScrollSnap-List"] [aria-selected="true"]')
    const tabName = currentTab?.textContent?.trim()
    if (!tabName) {
      // console.warn('cannot get current tab name')
      return
    }

    return (RECOMMEND_TAB_NAMES.indexOf(tabName) !== -1)

  },
  isEngagementTab() {
    // 日本語、英語のみ対応
    const ENGAGEMENT_TAB_NAMES = ['Quotes', '引用']

    const currentTab = document.querySelector('[data-testid="ScrollSnap-List"] [aria-selected="true"]')
    const tabName = currentTab?.textContent?.trim()
    if (!tabName) {
      // console.warn('cannot get current tab name')
      return
    }

    return (ENGAGEMENT_TAB_NAMES.indexOf(tabName) !== -1)

  },

  isSearchPage() {
    return document.querySelector('[data-testid="primaryColumn"] [data-testid="SearchBox_Search_Input"]')
  },
}
