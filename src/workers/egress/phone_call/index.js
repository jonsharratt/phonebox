import BaseWorker from '../../base'
import twilio from 'twilio'
import path from 'path'
import redis from 'redis'

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

  storeTwiml (id, twiml) {
    return new Promise(resolve => {
      this.redisClient.set(`phonebox:twiml:${id}`, twiml, 'px', 86400000, () => {
        resolve(id)
      })
    })
  }

  async renderTwiml (message) {
    return await this.render(
      path.join(__dirname, '../templates', 'twiml.ejs'),
      message
    )
  }

  async makeCall ({ to, from, baseUrl, session }) {
    try {
      await this.twilioClient.makeCall({
        method: 'GET',
        to: to,
        from: from,
        statusCallback: `${baseUrl}/twilio/call/${session}`,
        url: `${baseUrl}/twilio/twiml/${session}`,
        ifMachine: 'Hangup',
        statusCallbackEvent: ['completed']
      })
    } catch (err) {
      throw err
    }
  }

  async process (message, next) {
    try {
      const twiml = await this.renderTwiml(message)
      await this.storeTwiml(message.meta.session, twiml)
      await this.makeCall(message.meta)
      next(null)
    } catch (err) {
      next(err)
    }
  }
}

export default PhoneCall

