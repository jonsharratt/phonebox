import {
  name,
  version,
  description,
  author,
  bugs
} from './package.json'

import restify from 'restify'
import { ingress } from './handlers'

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

server.post('/ingress/:id', ingress.post)

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url)
})
