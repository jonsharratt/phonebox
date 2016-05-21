import {
  name,
  version,
  description,
  author,
  bugs
} from './package.json'

import restify from 'restify'
import { alerts } from './handlers'

const server = restify.createServer()
server.use(restify.bodyParser())

server.get('/', (req, res) => {
  res.json({
    name,
    version,
    description,
    author,
    bugs
  })
})

server.post('/alerts', alerts.post)

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url)
})
