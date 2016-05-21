export default function (rsmq, box) {
  require(`./${box}`).default(rsmq)
}

