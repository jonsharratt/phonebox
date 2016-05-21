import RedisSMQ from 'rsmq'

import IngressWorker from './ingress'

import { TextMessage, PhoneCall } from './egress'

const rsmq = new RedisSMQ({
  host: 'redis',
  port: 6379,
  ns: 'phonebox'
})

const ingressWorker = new IngressWorker(rsmq)
ingressWorker.start()

const textMessage = new TextMessage(rsmq)
textMessage.start()

const phoneCall = new PhoneCall(rsmq)
phoneCall.start()
