import RSMQWorker from 'rsmq-worker'
import ejs from 'ejs'
import Promise from 'bluebird'

const renderFile = Promise.promisify(ejs.renderFile)

export class BaseWorker extends RSMQWorker {
  constructor (name, rsmq) {
    super(name, { rsmq, timeout: 5000 })

    this.name = name
    this.rsmq = rsmq
    this.namespace = 'phonebox'

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

  storageKey (action, { session, type, channel }) {
    console.log(`${this.namespace}:${action}:${channel}:${type}:${session}`)
    return `${this.namespace}:${action}:${channel}:${type}:${session}`
  }

  async store (key, body) {
    return await this.redisClient.setAsync(key, JSON.stringify(body))
  }

  init () {
    this.rsmq.createQueue({ qname: this.name }, (error, res) => {
      if (error) throw error
      super.start()
    })
  }

  async render (file, message) {
    return await renderFile(file, message)
  }
}

export default BaseWorker
