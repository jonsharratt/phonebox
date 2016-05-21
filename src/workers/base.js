import RSMQWorker from 'rsmq-worker'
import ejs from 'ejs'
import fs from 'fs'

export class BaseWorker extends RSMQWorker {
  constructor (name, rsmq) {
    super(name, { rsmq })

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

  render (file, message) {
    const template = fs.readFileSync(file)
    return ejs.render(template.toString('utf-8'), JSON.parse(message))
  }
}

export default BaseWorker
