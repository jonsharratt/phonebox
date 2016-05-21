import { name, version, description } from './package.json'
import restify from 'restify'
import RedisSMQ from 'rsmq'

const rsmq = new RedisSMQ({
  host: 'redis',
  port: 6379,
  ns: 'phonebox'
})

function alertHandler (req, res, next) {
  rsmq.sendMessage({
    qname: 'alerts',
    message: req.body
  }, (err, id) => {
    if (err) return next(err)

    if (id) {
      return res.send(id)
    }
    return next()
  })
}

const server = restify.createServer()
server.use(restify.bodyParser())

server.get('/', (req, res) => {
  res.json({
    name,
    version,
    description
  })
})

server.post('/alerts', alertHandler)

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url)
})
