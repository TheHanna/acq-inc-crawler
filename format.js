const pad = n => n.toString().length > 1 ? n.toString() : `0${n.toString()}`

const dateFormatter = {
  audio: d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  xml: function(date) {
    let first = true
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Chicago',
      timeZoneName: 'short',
      hour12: false
    }).replace(/(?!^),/g, match => {
      let replace = first ? match : ''
      first = false
      return replace
    })
  }
}

const nameFormatter = {
  audio: n => n.toLowerCase().replace(/[^a-z0-9]+/gi, '-')
}

module.exports = {
  date: dateFormatter,
  name: nameFormatter
}