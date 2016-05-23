import fs from 'fs'
import path from 'path'
import redis from 'redis-mock'
import twilio from './mocks/twilio.js'
import message from './mocks/message.json'

const twiml = fs.readFileSync(
  path.join(__dirname, 'mocks', 'twiml.xml')
).toString('utf-8')

function phoneCall (scenario) {
  const PhoneCall = injectr('../../egress/phone_call/index.js', {
    redis,
    twilio: twilio[scenario]
  }, {
    console,
    process,
    path,
    __dirname: path.join(__dirname, '../')
  }).default

  return new PhoneCall(sinon.stub())
}

describe('Phone Call', () => {
  let fixture

  beforeEach(() => {
    fixture = message
  })

  describe('#renderTwiml', () => {
    it('should render correctly', () => {
      const subject = phoneCall('success')
      const actual = subject.renderTwiml(fixture)
      assert.equal(actual, twiml)
    })
  })

  describe('#storeTwiml', () => {
    let subject

    beforeEach(() => {
      sinon.spy(redis.RedisClient.prototype, 'set')
      subject = phoneCall('success')
    })

    it('should store twiml with 1 day expiry', async (done) => {
      await subject.storeTwiml('session-id', twiml)
      assert.isTrue(subject.redisClient.set.calledWith(
        'phonebox:twiml:session-id',
        twiml,
        'px',
        86400000))
      done()
    })

    afterEach(() => {
      sinon.restore(redis.RedisClient.prototype.set)
    })
  })
})

