import RSMQWorker from 'rsmq-worker'
import twilio from 'twilio'
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'

const client = new twilio.RestClient(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
)

export class BaseAlertWorker extends RSMQWorker {
  constructor (rsmq) {
    super('alerts', { rsmq })

    this.on('message', (message, next) => {
      this.process(message, next)
    })

    this.on('error', (err, msg) => {
      console.log('ERROR', err, msg.id)
    })

    this.on('exceeded', msg => {
      console.log('EXCEEDED', msg.id)
    })

    this.on('timeout', msg => {
      console.log('TIMEOUT', msg.id, msg.rc)
    })
  }

  templateFile (cwd, name) {
    return path.join(cwd, 'templates', name)
  }

  render (file, message, next) {
    const template = fs.readFileSync(file, { encoding: 'utf8' })
    return ejs.render(template, JSON.parse(message))
  }

  text (template, message, next) {
    client.messages.create({
      body: this.render(template, message),
      to: process.env.TWILIO_TO_NUMBER,
      from: process.env.TWILIO_FROM_NUMBER
    }, (err, response) => {
      if (err) return next(err)
      next()
    })
  }
}

export default BaseAlertWorker
