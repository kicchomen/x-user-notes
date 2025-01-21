const ANNOTATION_BUTTON_CLASS = 'user-annotation-btn';

const Injector = {
  inject(element, user, callback) {
    if (element.querySelector(`.${ANNOTATION_BUTTON_CLASS}`)) return

    const div = document.createElement('div')
    div.classList.add('follow-notes-area')
    const btn = this.createOpenButton(callback)
    const tags = this.createTags(user)
    div.appendChild(btn)
    div.appendChild(tags)
    element.insertBefore(div, element.firstChild)
  },
  createOpenButton(callback) {
    const button = document.createElement('button')
    button.classList.add(ANNOTATION_BUTTON_CLASS)
    const icon_url = chrome.runtime.getURL("assets/icon.png");
    button.innerHTML = `
      <img src="${icon_url}">Scribble
    `
    button.addEventListener('click', () => callback())
    return button
  },
  createTags(user) {
    const root = document.createElement('div')
    root.classList.add('tags')
    let tags = user.tags.split(',')
    tags.forEach(tag => {
      if (tag === '') return

      const tagElement = document.createElement('span')
      tagElement.classList.add('tag')
      tagElement.textContent = tag
      root.appendChild(tagElement)
    })

    // Scribble にデータが無いユーザはその旨のタグ表示
    // TODO: 要検討
    if (user.memo === '' && user.tags === '' && !user.history.length) {
      const tagElement = document.createElement('span')
      tagElement.classList.add('tag')
      tagElement.classList.add('no-tag')
      tagElement.textContent = "no data"
      root.appendChild(tagElement)
    }

    return root
  }
}
