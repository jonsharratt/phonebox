import BaseWorker from '../../base'
import twilio from 'twilio'
import path from 'path'
import redis from 'redis'
import uuid from 'uuid'

export class PhoneCall extends BaseWorker {
  constructor (rsmq) {
    super('phone_call', rsmq)

    this.redisClient = redis.createClient({
      host: 'redis'
    })

    this.twilioClient = new twilio.RestClient(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN
    )
  }

  storeTwiml (twiml) {
    return new Promise(resolve => {
      const id = uuid.v1()
      this.redisClient.set(`phonebox:twiml:${id}`, twiml, 'px', 86400000, () => {
        resolve(id)
      })
    })
  }

  renderTwiml (message) {
    return this.render(
      path.join(__dirname, '../templates', 'twiml.ejs'),
      message
    )
  }

  async makeCall (twimlId) {
    try {
      await this.twilioClient.makeCall({
        method: 'GET',
        to: process.env.TWILIO_TO_NUMBER,
        from: process.env.TWILIO_FROM_NUMBER,
        url: `${process.env.NGROK_URL}/twiml/${twimlId}`
      })
    } catch (err) {
      throw err
    }
  }

  async process (message, next) {
    try {
      const twiml = this.renderTwiml(message)
      const twimlId = await this.storeTwiml(twiml)
      await this.makeCall(twimlId)
      next(null)
    } catch (err) {
      next(err)
    }
  }
}

export default PhoneCall

