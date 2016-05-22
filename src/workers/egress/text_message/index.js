import BaseWorker from '../../base'
import twilio from 'twilio'
import path from 'path'

const client = new twilio.RestClient(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
)

export class TextMessage extends BaseWorker {
  constructor (rsmq) {
    super('text_message', rsmq)
  }

  body (message) {
    return this.render(
      path.join(__dirname, '../templates', 'plain_text.ejs'),
      message
    )
  }

  async process (message, next) {
    try {
      await client.sendMessage({
        body: this.body(message),
        to: process.env.TWILIO_TO_NUMBER,
        from: process.env.TWILIO_FROM_NUMBER
      })
      next()
    } catch (err) {
      next(err)
    }
  }
}

export default TextMessage

