// TODO: ここは inject 処理に特化して、html の生成は切り分けたい


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
    button.textContent = '📓 Open Scribble'
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

    if (user.memo === '' && user.tags === '') {
      const tagElement = document.createElement('span')
      tagElement.classList.add('tag')
      tagElement.classList.add('no-tag')
      tagElement.textContent = "no scribble"
      root.appendChild(tagElement)
    }

    return root
  }
}
