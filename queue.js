const _ = require('lodash')
const validate = require('./validate')

class DownloadQueue {
  constructor(params) {
    let defaults = {
      autoStart: true,
      maxRetries: 5,
      maxConcurrent: 3,
      path: ''
    }
    params = params ? _.assignIn(params, defaults) : defaults
    _.forEach(params, (value, key) => { this[key] = value })
    this.waiting = []
    this._active = []
    this.done = []
    this.active = new Proxy(this._active, {
      set: (target, key, value, receiver) => {
        if (Number(key) >= 0) value.download()
        return true
      }
    })
  }

  slotsOpen() {
    return this.active.length < this.maxConcurrent
  }

  add(file) {
    let dest = this.autoStart && this.slotsOpen ? this.active : this.waiting
    dest.push(file)
  }
}

module.exports = DownloadQueue
