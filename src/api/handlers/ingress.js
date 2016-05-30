import uuid from 'uuid'
import utils from 'async'
import Promise from 'bluebird'
import RedisSMQ from 'rsmq'

const rsmq = Promise.promisifyAll(new RedisSMQ({
  host: 'redis',
  ns: 'phonebox'
}))

const ENABLED_CHANNELS = [
  'text_message',
  'phone_call'
]

const meta = (req, channel) => {
  return {
    session: req.params.session || uuid.v1(),
    type: req.params.type,
    baseUrl: (req.isSecure()) ? 'https' : 'http' + `://${req.headers.host}`,
    to: req.query.to || process.env.TWILIO_TO_NUMBER,
    from: req.query.from || process.env.TWILIO_FROM_NUMBER,
    attempts: parseInt(req.query.attempts || 0),
    channel
  }
}

export default {
  post: async (req, res, next) => {
    utils.each(ENABLED_CHANNELS, async (channel, cb) => {
      await rsmq.sendMessageAsync({
        qname: 'ingress',
        message: JSON.stringify(Object.assign(req.body, { meta: meta(req, channel) }))
      })

      cb()
    }, err => {
      if (err) return next(err)
      res.json({ status: 'OK' })
    })
  }
}
