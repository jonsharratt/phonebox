import BaseEgressWorker from '../base'
import twilio from 'twilio'
import path from 'path'

const client = new twilio.RestClient(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
)

export class TextMessage extends BaseEgressWorker {
  process (message, next) {
    client.messages.create({
      body: super.render(
        path.join(__dirname, '../templates', 'plain_text.ejs'),
        message
      ),
      to: process.env.TWILIO_TO_NUMBER,
      from: process.env.TWILIO_FROM_NUMBER
    }, (err, response) => {
      if (err) return next(err)
      console.log('message sent:', response.sid)
      next()
    })
  }
}

export default TextMessage

