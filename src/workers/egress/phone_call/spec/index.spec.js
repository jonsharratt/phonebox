import fs from 'fs'
import path from 'path'
import redis from 'redis-mock'
import twilio from './mocks/twilio.js'
import message from './mocks/message.json'

const twiml = fs.readFileSync(
  path.join(__dirname, 'mocks', 'twiml.xml')
).toString('utf-8')

const process = {
  env: {
    TWILIO_TO_NUMBER: '000000',
    TWILIO_FROM_NUMBER: '000000'
  }
}

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
    it('should render correctly', async () => {
      const subject = phoneCall('success')
      const actual = await subject.renderTwiml(fixture)
      assert.equal(actual, twiml)
    })
  })

  describe('#makeCall', () => {
    let subject

    describe('with error', () => {
      beforeEach(() => {
        subject = phoneCall('error')
        sinon.spy(subject.twilioClient, 'makeCall')
      })

      it('should throw error up the stack', async (done) => {
        try {
          await subject.makeCall('foo', 'http://test')
        } catch (error) {
          assert.isNotNull(error)
          done()
        }
      })

      afterEach(() => {
        sinon.restore(subject.twilioClient)
      })
    })

    describe('without error', () => {
      beforeEach(() => {
        subject = phoneCall('success')
        sinon.spy(subject.twilioClient, 'makeCall')
      })

      it('should call twilio with correct parameters', () => {
        subject.makeCall(fixture.meta)

        assert.isTrue(subject.twilioClient.makeCall.calledWith({
          method: 'GET',
          to: '000000',
          from: '000000',
          statusCallback: 'http://test/twilio/call/phone_call/foo',
          url: 'http://test/twilio/twiml/phone_call/foo',
          ifMachine: 'Hangup',
          statusCallbackEvent: ['completed']
        }))
      })

      afterEach(() => {
        sinon.restore(subject.twilioClient)
      })
    })
  })

  describe('#storeTwiml', () => {
    let subject

    beforeEach(() => {
      sinon.spy(redis.RedisClient.prototype, 'set')
      subject = phoneCall('success')
    })

    it('should store twiml with 1 day expiry', async (done) => {
      await subject.storeTwiml(fixture.meta, twiml)
      assert.isTrue(subject.redisClient.set.calledWith(
        'phonebox:twiml:alert_source:phone_call:foo',
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

