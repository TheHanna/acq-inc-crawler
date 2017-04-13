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
  console.log('checking if file exists');
  fs.access(f, err => {
    if (err) {
      if (err.code === 'EEXIST') {
        console.log(f.filename, 'already exists at path', f.path)
        return
      }
      console.log(err)
      return
    }
    callback()
  })
}

module.exports = {
  setHostname: setHostname,
  url: url,
  file: file,
  notexist: notexist
}