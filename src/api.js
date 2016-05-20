import restify from 'restify'

function respond (req, res, next) {
  res.send('Hello World.')
  next()
}

const server = restify.createServer()

server.get('/', respond)

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url)
})
