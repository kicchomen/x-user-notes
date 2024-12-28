// interface User {
//   id: string,
//   memo: string,
//   tags: string,
//   latest: Profile,
//   history: Profile[],
//   version: string
// }

// interface Profile {
//   id: string,
//   name: string,
//   profile_image_url: string,
//   date: string,
//   version: string
// }

const Storage = {
  /**
   * @param {string} user_id 
   * @returns user
   */
  getUser(user_id) {
    let key = `user:${user_id}`
    return this.getJson(key)
  },
  /**
   * @param {User} user
   */
  setUser(user) {
    let key = `user:${user.id}`
    this.setJson(key, user)
  },
  async getJson(key) {
    result = await chrome.storage.local.get([key])
    if (!result[key]) return
    return JSON.parse(result[key])
  },
  setJson(key, value) {
    let json = JSON.stringify(value)
    let obj = {}
    obj[key] = json
    chrome.storage.local.set(obj)
  }
}
