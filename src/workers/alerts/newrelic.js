import BaseAlertWorker from './base'

export class NewRelicAlert extends BaseAlertWorker {
  process (message, next) {
    this.text(message, next)
  }
}

export default NewRelicAlert

