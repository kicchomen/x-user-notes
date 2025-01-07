const Extractor = {
  extractUserID(article) {
    return article.querySelector('[data-testid*="UserAvatar-Container-"] a').href.split('/').pop()
  },
  extractUserImage(article) {
    return article.querySelector('[data-testid="Tweet-User-Avatar"] img')?.src
  },
  extractUserName(article) {
    const userid = this.extractUserID(article)
    return article.textContent.split(`@${userid}`).shift()
  },
  extractAll(article) {
    this.extractUserID(article)
    this.extractUserName(article)
    this.extractUserImage(article)
  }
}
