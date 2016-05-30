import RSMQWorker from 'rsmq-worker'
import ejs from 'ejs'
import Promise from 'bluebird'

const renderFile = Promise.promisify(ejs.renderFile)

export class BaseWorker extends RSMQWorker {
  constructor (name, rsmq) {
    super(name, { rsmq, timeout: 5000 })

    this.name = name
    this.rsmq = rsmq

    this.on('message', (message, next) => {
      this.process(JSON.parse(message), next)
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

  start () {
    this.createQueue(this.name).then(() => {
      super.start()
    })
  }

  createQueue (name) {
    return new Promise((resolve, reject) => {
      return this.rsmq.createQueue({ qname: name }, (err, resp) => {
        if (err) return reject(err)
        resolve(resp)
      })
    })
  }

  async render (file, message) {
    return await renderFile(file, message)
  }
}

export default BaseWorker
