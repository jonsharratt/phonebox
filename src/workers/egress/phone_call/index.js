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

  storeTwiml ({ session, type }, twiml) {
    return new Promise(resolve => {
      this.redisClient.set(`phonebox:twiml:${type}:${session}`, twiml, 'px', 86400000, () => {
        resolve(session)
      })
    })
  }

  async renderTwiml (body) {
    return await this.render(
      path.join(__dirname, '../templates', 'twiml.ejs'),
      body
    )
  }

  async makeCall ({ to, from, baseUrl, session, type }) {
    try {
      await this.twilioClient.makeCall({
        method: 'GET',
        to: to,
        from: from,
        statusCallback: `${baseUrl}/twilio/call/${type}/${session}`,
        url: `${baseUrl}/twilio/twiml/${type}/${session}`,
        ifMachine: 'Hangup',
        statusCallbackEvent: ['completed']
      })
    } catch (err) {
      throw err
    }
  }

  async process ({ body, meta }, next) {
    try {
      const twiml = await this.renderTwiml(body)
      await this.storeTwiml(meta, twiml)
      await this.makeCall(meta)
      next(null)
    } catch (err) {
      next(err)
    }
  }
}

export default PhoneCall

