import Promise from 'bluebird'
import RedisSMQ from 'rsmq'

const rsmq = Promise.promisifyAll(new RedisSMQ({
  host: 'redis',
  port: 6379,
  ns: 'phonebox'
}))

const meta = (req) => {
  return {
    session: req.params.session || '',
    type: req.params.type,
    baseUrl: (req.isSecure()) ? 'https' : 'http' + `://${req.headers.host}`,
    to: req.query.to || '447919888886',
    from: req.query.from || '441337944037',
    attempts: req.query.attempts || 0
  }
}

export default {
  post: async (req, res, next) => {
    try {
      const id = await rsmq.sendMessageAsync({
        qname: 'ingress',
        message: JSON.stringify(Object.assign(req.body, { meta: meta(req) }))
      })
      res.json({ id })
    } catch (err) {
      next(err)
    }
  }
}
