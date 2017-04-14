const req = require('tinyreq')
const cheerio = require('cheerio')
const _ = require('lodash')

function scrape(url, matchers, callback) {
  console.log('attempting to scrape', url, 'for', _.keys(matchers))
  req(url, (err, body) => {
    if (err) return retry(err, url, matchers, callback)

    let $ = cheerio.load(body)
    let pageData = {}
    _.forEach(matchers, (value, key) => {
      let values = []
      $(value.selector).each((index, val) => {
        let v = (value.what) ? $(val)[value.how](value.what) : $(val)[value.how]()
        values.push(v)
      })
      pageData[key] = (values.length > 1) ? values : values[0]
    })
    callback(pageData)
  })
}

function retry(err, url, matchers, callback) {
  console.log('Error getting', url + ', retrying')
  scrape(url, matchers, callback)
}

module.exports = scrape
