import fs from 'fs'
import path from 'path'
import redis from 'redis-mock'
import twilio from './mocks/twilio.js'
import message from './mocks/message.json'

function phoneCall (scenario) {
  const PhoneCall = injectr('../../egress/phone_call/index.js', {
    redis,
    twilio: twilio[scenario],
    uuid: {
      v1: () => { return 'generated-uid' }
    }
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
  let twiml

  beforeEach(() => {
    fixture = JSON.stringify(message)
    twiml = fs.readFileSync(
      path.join(__dirname, 'mocks', 'twiml.xml')
    ).toString('utf-8')
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
      await subject.storeTwiml(twiml)
      assert.isTrue(subject.redisClient.set.calledWith(
        'phonebox:twiml:generated-uid',
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

