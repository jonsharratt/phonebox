import Promise from 'bluebird'
import BaseWorker from '../../base'

import redis from 'redis'
Promise.promisifyAll(redis.RedisClient.prototype)

export class CallStatusWorker extends BaseWorker {
  constructor (rsmq) {
    super('call_status', rsmq)
    this.rsmq = rsmq

    this.redisClient = redis.createClient({
      host: 'redis'
    })
  }

  async alert (meta) {
    const key = this.storageKey('alert', meta)
    const data = await this.redisClient.getAsync(key)
    return JSON.parse(data)
  }

  async addAttempt ({ meta }) {
    const key = this.storageKey('attempt', meta)
    return await this.redisClient.incrAsync(key)
  }

  async resend (message, attempts) {
    await this.rsmq.sendMessageAsync({
      qname: 'alert',
      message: JSON.stringify(message),
      delay: parseInt(attempts) * 3
    })
  }

  async retry (message) {
    const attempts = await this.addAttempt(message)
    await this.resend(message, attempts)
  }

  async process ({ body, meta }, next) {
    const message = await this.alert(meta)

    switch (body.CallStatus) {
      case 'no-answer':
      case 'cancelled':
      case 'busy':
      case 'failed':
        await this.retry(message)
        break
      case 'completed':
        if (body.AnsweredBy === 'human') {
          console.log('complete')
        } else {
          console.log('Call Answered By Machine, Retry')
          await this.retry(message)
        }
    }
    next()
  }
}

export default CallStatusWorker

