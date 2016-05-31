import Promise from 'bluebird'
import BaseWorker from '../../base'

import rota from '../../rota.json'

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

  async process ({ body, meta }, next) {
    const { session, type, channel } = meta

    const attempts = await this.redisClient.getAsync(this.storageKey('attempt', meta))
    if (attempts >= 3) {
      if (meta.index >= rota.length) return next()
      meta.index = meta.index + 1
    }

    meta.person = rota[meta.index]
    await this.store(this.storageKey('alert', meta), { meta, body })

    const rendered = await this.render(`${__dirname}/${type}.ejs`, { meta, body })
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

