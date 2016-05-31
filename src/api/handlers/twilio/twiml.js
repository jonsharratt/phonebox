import Promise from 'bluebird'

import redis from 'redis'
Promise.promisifyAll(redis.RedisClient.prototype)

const client = redis.createClient({ host: 'redis' })

export default {
  get: async (req, res, next) => {
    try {
      const twiml = await client.getAsync(`phonebox:twiml:phone_call:${req.params.type}:${req.params.session}`)
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(twiml),
        'Content-Type': 'text/xml'
      })
      res.write(twiml)
      res.end()
      next()
    } catch (err) {
      next(err)
    }
  }
}
