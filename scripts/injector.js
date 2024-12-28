const ANNOTATION_BUTTON_CLASS = 'user-annotation-btn';

const Injector = {
  inject(element, user_id) {
    if (element.querySelector(`.${ANNOTATION_BUTTON_CLASS}`)) return

    const div = document.createElement('div')
    div.classList.add('follow-notes-area')
    const btn = this.createOpenButton(user_id)
    const tags = this.createTags()
    div.appendChild(btn)
    div.appendChild(tags)
    element.insertBefore(div, element.firstChild)
  },
  createOpenButton(user_id) {
    const button = document.createElement('button')
    button.classList.add(ANNOTATION_BUTTON_CLASS)
    button.textContent = '📓 Open Note'
    button.addEventListener('click', () => openNote(user_id))
    return button
  },
  createTags() {
    const tags = document.createElement('div')
    tags.classList.add('tags')
    tags.innerHTML = `
      <span class="tag">friend</span>
      <span class="tag">for campaign</span>
      <span class="tag">削除よてい</span>
    `
    return tags
  },
  openNote(user_id) {}
}
