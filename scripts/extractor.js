// TODO:
//   repost や広告に対応


const Extractor = {
  extractUserID(article) {
    return article.querySelector('[data-testid*="UserAvatar-Container-"] a').href.split('/').pop()
  },
  extractUserImage(article) {
    // タイムライン
    const img_elm = article.querySelector('[data-testid="Tweet-User-Avatar"] img')
    if (img_elm) return img_elm.src

    // フォロー一覧
    return article.lastChild.firstChild.querySelector('img')?.src
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
  }
}
