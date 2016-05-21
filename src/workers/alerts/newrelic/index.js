import BaseAlertWorker from '../base'

export class NewRelicAlert extends BaseAlertWorker {
  process (message, next) {
    this.text(
      this.templateFile(__dirname, 'text.ejs'),
      message,
      next
    )
  }
}

export default NewRelicAlert

