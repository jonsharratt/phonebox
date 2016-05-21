import RedisSMQ from 'rsmq'

const rsmq = new RedisSMQ({
  host: 'redis',
  port: 6379,
  ns: 'phonebox'
})

rsmq.createQueue({ qname: 'alerts' }, (err, resp) => {
  if (err) throw err

  if (resp === 1) {
    console.log('Alerts Queue Created.')
  }
})

rsmq.createQueue({ qname: 'calls' }, (err, resp) => {
  if (err) throw err

  if (resp === 1) {
    console.log('Calls Queue Created.')
  }
})

