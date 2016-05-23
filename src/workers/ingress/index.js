import BaseWorker from '../base'
import utils from 'async'
import uuid from 'uuid'
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
      this.redisClient.set(`phonebox:ingress:${session}`, body, (err, reply) => {
        if (err) return reject(err)
        resolve(reply)
      })
    })
  }

  async process (message, next) {
    const session = uuid.v1()
    const body = this.render(`${__dirname}/${message.type}.ejs`, Object.assign(message, { session }))
    await this.store(session, body)

    utils.each(this.channels, (channel, cb) => {
      this.rsmq.sendMessage({
        qname: channel,
        message: body
      }, cb)
    }, err => {
      if (err) return next(err)
      next()
    })
  }
}

export default IngressWorker

