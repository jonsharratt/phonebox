import RedisSMQ from 'rsmq'
import { NewRelicAlert } from './alerts'

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
  await createQueue('alerts')
  await createQueue('calls')

  const newRelicAlert = new NewRelicAlert(rsmq)
  newRelicAlert.start()
})()

