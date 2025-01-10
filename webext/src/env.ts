const forbiddenProtocols = [
  'chrome-extension://',
  'chrome-search://',
  'chrome://',
  'devtools://',
  'edge://',
  'https://chrome.google.com/webstore',
]

export function isForbiddenUrl(url: string): boolean {
  return forbiddenProtocols.some(protocol => url.startsWith(protocol))
}

export const isFirefox = navigator.userAgent.includes('Firefox')

export const SYSTEM_VERSION = '1.0.0'

const ARTICLE_SELECTOR = 'article[role=article][data-testid="tweet"] > div'
const USER_SELECTOR = 'button[data-testid="UserCell"]'
export const ARTICLE_SELECTOR_PATTERNS = [
  ARTICLE_SELECTOR,
  USER_SELECTOR,
  // 追加の選択子を必要に応じて追加
]
