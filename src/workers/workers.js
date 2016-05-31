import Promise from 'bluebird'
import RedisSMQ from 'rsmq'

const rsmq = Promise.promisifyAll(new RedisSMQ({
  host: 'redis',
  ns: 'phonebox'
}))

import AlertWorker from './ingress/alert'
import CallStatusWorker from './ingress/call_status'

import { TextMessage, PhoneCall } from './egress'

const alertWorker = new AlertWorker(rsmq)
alertWorker.init()

const callStatusWorker = new CallStatusWorker(rsmq)
callStatusWorker.init()

const textMessage = new TextMessage(rsmq)
textMessage.init()

const phoneCall = new PhoneCall(rsmq)
phoneCall.init()

