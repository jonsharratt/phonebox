import injectr from 'injectr'

injectr.onload = (filename, content) =>
  require('babel-core').transform(content, {
    filename
  }).code
