import Promise from 'bluebird'
import BaseWorker from '../../base'

import redis from 'redis'
Promise.promisifyAll(redis.RedisClient.prototype)

export class AlertWorker extends BaseWorker {
  constructor (rsmq) {
    super('alert', rsmq)
    this.rsmq = rsmq

    this.redisClient = redis.createClient({
      host: 'redis'
    })
  }

  async store (key, body) {
    return await this.redisClient.setAsync(`phonebox:alert:${key}`, JSON.stringify(body))
  }

  rota () {
    return ['447919888886', '2', '3']
  }

  async process ({ body, meta }, next) {
    const rota = this.rota()
    const { session, type, channel } = meta

    const attempts = await this.redisClient.getAsync(`phonebox:attempts:${channel}:${type}:${session}`)
    if (attempts >= 3) {
      if (meta.index >= rota.length) return next()
      meta.index = (meta.index || 0) + 1
      meta.to = rota[meta.index]
    }

    await this.store(`${channel}:${type}:${session}`, { meta, body })

    const rendered = await this.render(`${__dirname}/${type}.ejs`, body)
    const message = JSON.stringify({ meta, body: JSON.parse(rendered) })

    await this.rsmq.sendMessageAsync({
      qname: channel,
      message,
      delay: 0
    })

    next()
  }
}

export default AlertWorker

