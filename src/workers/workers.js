import RedisSMQ from 'rsmq'

import IngressWorker from './ingress'

import { TextMessage } from './egress'

const rsmq = new RedisSMQ({
  host: 'redis',
  port: 6379,
  ns: 'phonebox'
})

function createQueue (name) {
  return new Promise((resolve, reject) => {
    return rsmq.createQueue({ qname: name }, (err, resp) => {
      if (err) return reject(err)
      resolve(resp)
    })
  })
}

(async function () {
  await createQueue('ingress')
  await createQueue('egress')

  const ingressWorker = new IngressWorker(rsmq)
  ingressWorker.start()

  const textMessage = new TextMessage(rsmq)
  textMessage.start()
})()

