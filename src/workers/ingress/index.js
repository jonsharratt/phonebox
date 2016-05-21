import BaseWorker from '../base'
import utils from 'async'

export class IngressWorker extends BaseWorker {
  constructor (rsmq) {
    super('ingress', rsmq)
    this.rsmq = rsmq
  }

  process (message, next) {
    const data = JSON.parse(message)

    utils.each(this.channels, (channel, cb) => {
      this.rsmq.sendMessage({
        qname: channel,
        message: this.render(`${__dirname}/${data.type}.ejs`, message)
      }, cb)
    }, err => {
      if (err) return next(err)
      next()
    })
  }
}

export default IngressWorker

