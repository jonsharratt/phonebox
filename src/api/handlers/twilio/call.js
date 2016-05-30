import Promise from 'bluebird'
import RedisSMQ from 'rsmq'

import redis from 'redis'
Promise.promisifyAll(redis.RedisClient.prototype)

const client = redis.createClient({ host: 'redis' })
const rsmq = Promise.promisifyAll(new RedisSMQ({
  host: 'redis',
  port: 6379,
  ns: 'phonebox'
}))

async function retry (message) {
  return await rsmq.sendMessageAsync({
    qname: 'ingress',
    message
  })
}

export default {
  post: async (req, res, next) => {
    try {
      const session = req.params.session
      const body = await client.getAsync(`phonebox:ingress:${session}`)

      switch (req.body.CallStatus) {
        case 'no-answer':
        case 'cancelled':
        case 'busy':
        case 'failed':
          console.log('Retry, Status:', req.body.CallStatus)
          await retry(body)
          break
        case 'completed':
          if (req.body.AnsweredBy === 'human') {
            console.log('Call Answered By Person')
          } else {
            console.log('Call Answered By Machine, Retry')
            await retry(body)
          }
      }
      res.json({ session })
    } catch (err) {
      next(err)
    }
  }
}
