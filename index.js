const req = require('tinyreq')
const cheerio = require('cheerio')
const _ = require('lodash')
const url = require('url')
const fs = require('fs')
const http = require('follow-redirects').http
let parsedUrl = ''

function scrape(link, matchers, callback) {
  req(link, (err, body) => {
    if (err) return callback(err)

    let $ = cheerio.load(body)
    let pageData = {}
    _.forEach(matchers, (value, key) => {
      let values = []
      $(value.selector).each((index, val) => {
        if (value.what) {
          values.push($(val)[value.how](value.what))
        } else {
          values.push($(val)[value.how]())
        }
      })
      pageData[key] = (values.length > 1) ? values : values[0]
    })
    callback(null, pageData)
  })
}

function getLinks(link, callback, selector) {
  parsedUrl = url.parse(link)
  scrape(link, {
    files: {
      selector: selector,
      how: 'attr',
      what: 'href'
    }
  }, callback)
}

function getAudioFileData(err, links) {
  if (err) return
  // let link = links.files[0]
  // if (url.parse(link).hostname !== parsedUrl.hostname) return
  // scrape(link, {
  //   file: {selector: 'audio source[type="audio/wav"]', how: 'attr', what: 'src'},
  //   date: {selector: '#timelineDates > li.current > h4', how: 'text'},
  //   name: {selector: 'header h3', how: 'text'}
  // }, getAudioFile)
  _.forEach(links.files, link => {
    if (url.parse(link).hostname !== parsedUrl.hostname) return
    scrape(link, {
      file: {selector: 'audio source[type="audio/wav"]', how: 'attr', what: 'src'},
      date: {selector: '#timelineDates > li.current > h4', how: 'text'},
      name: {selector: 'header h3', how: 'text'}
    }, getAudioFile)
  })
}

function getAudioFile(err, link) {
  if (err || !link.file || !link.name || !link.date) return
  let linkUrl = url.parse(link.file)
  let fileName = link.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-')
  let fileDate = new Date(link.date)
  let fileYear = fileDate.getFullYear().toString()
  let fileMonth = ((fileDate.getMonth() + 1).toString().length > 1) ?
                  (fileDate.getMonth() + 1).toString() :
                  `0${fileDate.getMonth() + 1}`
  let fileDay = fileDate.getDate()
  let fullName = `${fileName}-${fileYear}-${fileMonth}-${fileDay}.mp3`
  let file = fs.createWriteStream('podcasts/' + fullName)
  http.get({
    hostname: linkUrl.hostname,
    path: linkUrl.path,
    port: 80
  }, response => {
    response.on('data', data => {
      file.write(data)
    }).on('end', () => {
      file.end()
      console.log(fullName, 'downloaded')
    })
  })
}

getLinks('http://www.acq-inc.com/portfolio', getAudioFileData, 'a.gradBtn')
