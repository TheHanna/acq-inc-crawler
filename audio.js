const _ = require('lodash')
const urlparser = require('url')
const fs = require('fs')
const http = require('follow-redirects').http
const scrape = require('./scrape')
const format = require('./format')
const validate = require('./validate')

class AudioFile {
  constructor(params) {
    let valid = validate.file(params)
    if (valid) {
      this.url = urlparser.parse(params.source)
      this.date = format.date.audio(new Date(params.date))
      this.name = format.name.audio(params.name)
      this.path = params.path
      this.extension = params.extension ? params.extension : 'mp3'
      this.filename = `${this.date}-${this.name}.${this.extension}`
      this.filepath = `${this.path}${this.filename}`
      this.download = false
      this.downloaded = null
    } else {
      throw new Error('Invalid parameter(s)')
    }
  }

  fetch(callback) {
    http.request({
      method: 'HEAD',
      hostname: this.url.hostname,
      path: this.url.path,
      port: 80
    }, callback).on('error', httpErr => {
      this.fetch(callback)
    }).end()
  }

  download() {
    path = (path.search(/\/$/) > 0) ? path : `${path}/`
    http.get({
      hostname: this.url.hostname,
      path: this.url.path,
      port: 80
    }, res => {
      this.write(path, res)
    }).on('error', httpErr => {
      console.log(httpErr.code)
      this.download(path)
    }).end()
  }

  write(data) {
    let filename = `${path}${this.filename}-${this.name}.mp3`
    let file = fs.createWriteStream(filename).on('open', fd => {
      console.log(filename, fd)
    })
    file.end()
    // data.on('readable', () => {
    //   file = fs.createWriteStream(name, { flags: 'wx' })
    // }).on('data', chunk => {
    //   if (file) file.write(chunk)
    // }).on('end', () => {
    //   if (file) file.end()
    // })
  }
}

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
    this.active = []
    this.done = []
  }

  slotsOpen() {
    return this.active.length < this.maxConcurrent
  }

  add(file) {
    validate.notexist(file.filepath, () => {
      let dest = this.autoStart && this.slotsOpen ? this.active : this.waiting
      dest.push(file)
      console.log('added file to queue');
    })
  }
}

let queue = new DownloadQueue()

function init(url) {
  scrape(url, {
    files: {
      selector: 'a.gradBtn',
      how: 'attr',
      what: 'href'
    }
  }, compile)
  return true
}

function compile(data) {
  let file = data.files[0]
  // _.forEach(data.files, file => {
    if (!validate.url(file)) return
    scrape(file, {
      source: {
        selector: 'audio source[type="audio/wav"]',
        how: 'attr',
        what: 'src'
      },
      date: {
        selector: '#timelineDates > li.current > h4',
        how: 'text'
      },
      name: {
        selector: 'header h3',
        how: 'text'
      }
    }, build)
  // })
}

function build(params) {
  params.path = 'podcasts/'
  console.log('building...');
  let file = new AudioFile(params)
  file.fetch(res => {
    console.log(res.statusCode)
    if (res.statusCode === 200) queue.add(file)
    // console.log(res.statusCode)
    // if (res.statusCode === 200) file.download('podcasts/')
  })
}

module.exports = init
