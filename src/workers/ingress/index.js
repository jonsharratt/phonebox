import BaseWorker from '../base'
import redis from 'redis'

export class IngressWorker extends BaseWorker {
  constructor (rsmq) {
    super('ingress', rsmq)
    this.rsmq = rsmq

    this.redisClient = redis.createClient({
      host: 'redis'
    })
  }

  store (session, body) {
    return new Promise((resolve, reject) => {
      this.redisClient.set(`phonebox:ingress:${session}`, JSON.stringify(body), (err, reply) => {
        if (err) return reject(err)
        resolve(reply)
      })
    })
  }

  async process (message, next) {
    const { session, type, attempts, channel } = message.meta

    if (attempts >= 3) return next()
    message.meta.attempts = message.meta.attempts + 1

    await this.store(session, message)
    const body = await this.render(`${__dirname}/${type}.ejs`, message)

    this.rsmq.sendMessage({
      qname: channel,
      message: body,
      delay: attempts * 180
    }, next)
  }
}

export default IngressWorker

