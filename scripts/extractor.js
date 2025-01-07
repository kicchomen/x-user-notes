const Extractor = {
  extractUserID(article) {
    return article.querySelector('[data-testid="Tweet-User-Avatar"] a')?.href.split('/').pop()
  },
  extractUserImage(article) {
    return article.querySelector('[data-testid="Tweet-User-Avatar"] img')?.src
  },
  extractUserName(article) {
    return article.querySelector('[data-testid="User-Name"] a').textContent
  },
  extractAll(article) {
    this.extractUserID(article)
    this.extractUserName(article)
    this.extractUserImage(article)
  }
}
