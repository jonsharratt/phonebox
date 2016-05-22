import Promise from 'bluebird'
import RedisSMQ from 'rsmq'

const rsmq = Promise.promisifyAll(new RedisSMQ({
  host: 'redis',
  port: 6379,
  ns: 'phonebox'
}))

export default {
  post: async (req, res, next) => {
    try {
      const id = await rsmq.sendMessageAsync({
        qname: 'ingress',
        message: JSON.stringify(Object.assign(req.body, {
          type: req.params.id,
          base_url: (req.isSecure()) ? 'https' : 'http' + `://${req.headers.host}`
        }))
      })
      res.json({ id })
    } catch (err) {
      next(err)
    }
  }
}
