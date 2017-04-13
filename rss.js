const _ = require('lodash')
const cheerio = require('cheerio')
const scrape = require('./scrape')
const format = require('./format')

function init(url) {
  scrape(url, {
    title: {
      selector: 'div.podcast header h3',
      how: 'text'
    },
    date: {
      selector: '#timeline li.date h4',
      how: 'text'
    }
  }, compile)
  return true
}

function compile(data) {
  let items = []

  _.forEach(data.title, title => {
    items.push({title: title})
  })

  _.forEach(data.date, (date, i) => {
    items[i].date = new Date(date)
  })

  build(items)
}

function build(items) {
  let $ = cheerio.load('<items/>')

  _.forEach(items, item => {
    let $item = $('<item/>')
    let guid = format.name.audio(
      'http://thehanna.com/podcast/',
      item.title,
      item.date
    )
    $item.append(
      $(`<title>${item.title}</title>`),
      $(`<description>${item.title}</description>`),
      $(`<enclosure url="${guid}" type="audio/mpeg" length="1" />`),
      $(`<guid>${guid}</guid>`),
      $(`<pubDate>${format.date.xml(item.date)}</pubDate>`)
    )
    $('items').append($item)
  })

  console.log($.html());
}

module.exports = init
