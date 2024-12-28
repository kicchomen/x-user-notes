const Extractor = {
  extractUserID(article) {
    return article.querySelector('a')?.href.split('/').pop()
  },
  extractUserImage(article) {
    return article.querySelector('a img')?.src
  },
  extractUserName(article) {
    return article.querySelectorAll('a')[1].textContent
  },
  extractAll(article) {
    this.extractUserID(article)
    this.extractUserName(article)
    this.extractUserImage(article)
  }
}
