import path from 'path'
import redis from 'redis-mock'
import expected from './mocks/expected.json'
import fixture from './mocks/message.json'
import rota from './mocks/rota.json'
import rsmq from './mocks/rsmq'

function alert () {
  const Alert = injectr('../../ingress/alert/index.js', {
    redis,
    '../../rota.json': rota
  }, {
    console,
    rsmq,
    path,
    __dirname: path.join(__dirname, '../')
  }).default

  return new Alert(rsmq)
}

describe('Alert', () => {
  describe('#process', () => {
    describe('less than three attempts', () => {
      let subject
      let next

      beforeEach(() => {
        subject = alert()
        sinon.spy(subject.rsmq, 'sendMessageAsync')
        next = sinon.stub()
      })

      it('should set meta data person correctly', async () => {
        await subject.process(fixture, next)
        assert.isNotNull(fixture.meta.person)
      })

      it('should send message for egress worker correctly', async () => {
        const expectedMessage = JSON.stringify({ body: expected.body, meta: expected.meta })

        await subject.process(fixture, next)
        assert.isTrue(rsmq.sendMessageAsync.calledWith({
          qname: 'phone_call',
          message: expectedMessage,
          delay: 0
        }))
      })

      it('should remove message from the queue', async () => {
        await subject.process(fixture, next)
        assert.isTrue(next.calledWith(null))
      })

      afterEach(() => {
        sinon.restore(subject.rsmq)
      })
    })

    describe('greater than or equal to three attempts', () => {
      let subject
      let next

      beforeEach(() => {
        subject = alert()
        next = sinon.stub()
        sinon.stub(subject.redisClient, 'getAsync').returns(3)
      })

      it('should increment meta index by 1', async () => {
        await subject.process(fixture, next)
        assert.equal(fixture.meta.index, 1)
      })

      it('should be next person in rota', async () => {
        await subject.process(fixture, next)
        assert.deepEqual(fixture.meta.person, rota[1])
      })

      afterEach(() => {
        fixture.meta.index = 0
        sinon.restore(subject.rsmq)
        sinon.restore(subject.redisClient)
      })
    })

    describe('ran out of people to call', () => {
      let subject
      let next

      beforeEach(() => {
        fixture.meta.index = 3
        subject = alert()
        next = sinon.stub()
      })

      it('should remove message from queue and stop', async () => {
        await subject.process(fixture, next)
        assert.isTrue(next.calledWith(null))
      })

      it('should not increment index further', async () => {
        await subject.process(fixture, next)
        assert.equal(fixture.meta.index, 3)
      })

      afterEach(() => {
        fixture.meta.index = 0
        sinon.restore(subject.rsmq)
        sinon.restore(subject.redisClient)
      })
    })
  })
})

