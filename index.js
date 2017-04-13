const argv = require('yargs').argv
const rss = require('./rss')
const audio = require('./audio')
const validate = require('./validate')

function run(can) {
  if (!can) return console.log('Please provide a valid URL')
  let feed = argv.d ? rss(argv.url) : false
  let files = argv.a ? audio(argv.url) : false
  if (!feed && !files) return console.log('Please indicate what to fetch (audio or feed)');
}

run(validate.setHostname(argv.url))