import BaseWorker from '../../base'
import twilio from 'twilio'

const client = new twilio.RestClient(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
)

export class PhoneCall extends BaseWorker {
  constructor (rsmq) {
    super('phone_call', rsmq)
  }

  process (message, next) {
    client.makeCall({
      to: process.env.TWILIO_TO_NUMBER,
      from: process.env.TWILIO_FROM_NUMBER,
      url: 'http://demo.twilio.com/docs/voice.xml'
    }, (err, response) => {
      if (err) return next(err)
      next()
    })
  }
}

export default PhoneCall

