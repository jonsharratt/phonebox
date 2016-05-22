import BaseWorker from '../../base'
import twilio from 'twilio'
import path from 'path'

export class TextMessage extends BaseWorker {
  constructor (rsmq) {
    super('text_message', rsmq)

    this.client = new twilio.RestClient(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN
    )
  }

  body (message) {
    return this.render(
      path.join(__dirname, '../templates', 'plain_text.ejs'),
      message
    )
  }

  async process (message, next) {
    try {
      await this.client.sendMessage({
        body: this.body(message),
        to: process.env.TWILIO_TO_NUMBER,
        from: process.env.TWILIO_FROM_NUMBER
      })
      next(null)
    } catch (err) {
      next(err)
    }
  }
}

export default TextMessage

