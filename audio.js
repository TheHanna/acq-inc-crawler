const _ = require('lodash')
const urlparser = require('url')
const fs = require('fs')
const http = require('follow-redirects').http
const scrape = require('./scrape')
const DownloadQueue = require('./queue')
const format = require('./format')
const validate = require('./validate')

let queue = new DownloadQueue()

class AudioFile {
  constructor(params) {
    console.log('audio file construction begun')
    let valid = validate.file(params)
    if (valid) {
      console.log('audio file construction successful')
      this.url = urlparser.parse(params.source)
      this.date = format.date.audio(new Date(params.date))
      this.name = format.name.audio(params.name)
      this.path = params.path.search(/\/$/) > 0 ? params.path : `${params.path}/`
      this.extension = params.extension ? params.extension : 'mp3'
      this.filename = `${this.date}-${this.name}.${this.extension}`
      this.filepath = `${this.path}${this.filename}`
      this.downloaded = null
    } else {
      throw new Error('Invalid parameter(s)')
    }
  }

  fetch(callback) {
    console.log('fetching audio data')
    http.request({
      method: 'HEAD',
      hostname: this.url.hostname,
      path: this.url.path,
      port: 80
    }, callback).on('error', httpErr => {
      console.log('FETCH ERROR:', httpErr.code)
      this.fetch(callback)
    }).end()
  }

  download() {
    console.log('downloading audio file')
    http.get({
      hostname: this.url.hostname,
      path: this.url.path,
      port: 80
    }, res => {
      this.write(res)
    }).on('error', httpErr => {
      console.log('DOWNLOAD ERROR:', httpErr.code)
      if (httpErr.code === 'EEXIST') return
      this.download()
    }).end()
  }

  write(data) {
    console.log('writing audio data')
    let file = fs.createWriteStream(this.filepath, { flags: 'wx' })
      .on('open', fd => {
        data.on('data', chunk => file.write(chunk))
            .on('end', () => file.end())
      })
      .on('error', err => {
        data.destroy(err)
        file.end()
      })
  }
}

function init(url) {
  console.log('initializing audio module')
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
  console.log('compiling audio data')
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
  console.log('building audio file objects')
  params.path = 'podcasts/'
  let file = new AudioFile(params)
  file.fetch(res => {
    console.log('audio data fetched', res.statusCode)
    if (res.statusCode === 200) queue.add(file)
  })
}

module.exports = init
