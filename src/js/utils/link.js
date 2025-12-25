class LinkUtility {
  linkElement
  constructor(linkID) {
    const element = document.getElementById(linkID)
    if (!element) {
      throw new Error('Link Element Not Found')
    }
    if (element.tagName !== 'A') {
      throw new Error('Not A Link Element')
    }
    this.linkElement = element
  }
  setLink(title, href, openInNewTab = false) {
    this.linkElement.href = href
    this.linkElement.textContent = title
    if (openInNewTab) {
      this.linkElement.target = '_blank'
      this.linkElement.rel = 'noopener noreferrer'
    } else {
      this.linkElement.target = ''
      this.linkElement.rel = ''
    }
  }
  getLink() {
    return {
      title: this.linkElement.textContent || '',
      href: this.linkElement.href,
      target: this.linkElement.target,
      rel: this.linkElement.rel,
    }
  }
}

module.exports = LinkUtility
