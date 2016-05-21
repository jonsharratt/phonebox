import BaseWorker from '../base'

export class IngressWorker extends BaseWorker {
  constructor (rsmq) {
    super('ingress', rsmq)
    this.rsmq = rsmq
  }

  process (message, next) {
    const data = JSON.parse(message)
    this.rsmq.sendMessage({
      qname: 'egress',
      message: this.render(`${__dirname}/${data.type}.ejs`, message)
    }, (err, resp) => {
      if (err) return next(err)
      next()
    })
  }
}

export default IngressWorker

