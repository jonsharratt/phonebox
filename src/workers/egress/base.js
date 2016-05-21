import BaseWorker from '../base'

export class BaseEgressWorker extends BaseWorker {
  constructor (rsmq) {
    super('egress', rsmq)
  }
}

export default BaseEgressWorker
