const _ = require('lodash')
const fs = require('fs')
const urlparser = require('url')
let hostname = null

function setHostname(url) {
  let parsed = urlparser.parse(url)
  hostname = (parsed.hostname) ? parsed.hostname : null
  return !!hostname
}

const url = url => hostname === urlparser.parse(url).hostname

const file = f => url(f.source) && !!f.name && !!Date.parse(f.date)

const notexist = (f, callback) => {
  console.log('checking if file exists', f)
  fs.access(f, err => {
    console.log(err)
    if (err) {
      if (err.code === 'EEXIST') {
        console.log(f, 'already exists')
        return
      }
      console.log(err)
      return
    }
    console.log(f.filename, 'file does not exist at path', f.path)
    callback()
  })
}

module.exports = {
  setHostname: setHostname,
  url: url,
  file: file,
  notexist: notexist
}