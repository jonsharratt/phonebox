import Promise from 'bluebird'
import RedisSMQ from 'rsmq'

const rsmq = Promise.promisifyAll(new RedisSMQ({
  host: 'redis',
  ns: 'phonebox'
}))

export default {
  post: async ({ query, params, body }, res, next) => {
    try {
      await rsmq.sendMessageAsync({
        qname: 'call_status',
        message: JSON.stringify({
          body,
          meta: {
            session: params.session,
            type: params.type,
            channel: 'phone_call'
          }
        })
      })
      res.json({ status: 'OK' })
    } catch (error) {
      console.log(error)
      res.json({ status: 'ERROR' })
    }
  }
}
