import path from 'path'
import twilio from './mocks/twilio.js'
import message from './mocks/message.json'

function textMessage (scenario) {
  const TextMessage = injectr('../../egress/text_message/index.js', {
    'twilio': twilio[scenario]
  }, {
    process,
    path,
    __dirname: path.join(__dirname, '../')
  }).default

  return new TextMessage(sinon.stub())
}

describe('Text Message', () => {
  let fixture
  let next

  beforeEach(() => {
    fixture = JSON.stringify(message)
    next = sinon.stub()
  })

  describe('#body', () => {
    it('should render in plain text', () => {
      const subject = textMessage('success')
      const body = subject.body(fixture)

      assert.equal(body, 'account foo\nbar severity\nfoo bar details\n')
    })
  })

  describe('#process', () => {
    describe('with error', () => {
      let subject

      beforeEach(() => {
        subject = textMessage('error')
        sinon.spy(subject.client, 'sendMessage')
      })

      it('should pass error to base worker', async (done) => {
        await subject.process(fixture, next)
        assert.isFalse(next.calledWith(null))
        done()
      })

      afterEach(() => {
        sinon.restore(subject.client)
      })
    })

    describe('without error', () => {
      let subject

      beforeEach(() => {
        subject = textMessage('success')
        sinon.spy(subject.client, 'sendMessage')
      })

      it('should send a text message', async (done) => {
        await subject.process(fixture, next)
        assert.isTrue(subject.client.sendMessage.called)
        done()
      })

      it('should delete message from queue', async (done) => {
        await subject.process(fixture, next)
        assert.isTrue(next.calledWith(null))
        done()
      })

      afterEach(() => {
        sinon.restore(subject.client)
      })
    })
  })
})

