import success from './fixtures/success.json'
import error from './fixtures/error.json'

export default {
  success: {
    RestClient: class {
      sendMessage () {
        return Promise.resolve(success)
      }
    }
  },
  error: {
    RestClient: class {
      sendMessage () {
        return Promise.reject(error)
      }
    }
  }
}
