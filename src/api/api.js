import {
  name,
  version,
  description,
  author,
  bugs
} from './package.json'

import {
  ingress,
  twiml,
  call
} from './handlers'

import restify from 'restify'

const server = restify.createServer()
server.use(restify.bodyParser({ mapParams: false }))

server.get('/', (req, res) => {
  res.json({
    name,
    version,
    description,
    author,
    bugs
  })
})

server.post('/call/:id', call.post)
server.post('/ingress/:type/:session', ingress.post)
server.get('/twiml/:id', twiml.get)

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url)
})
