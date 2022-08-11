import mqttClient, { PING_CHANNEL } from "../src/utils/mqtt"
import debug from 'debug'

const log = debug('pinger')

class Pinger {
  start() {
    this.doPing()
    setInterval(() => {
      this.doPing()
    }, 30_000)
  }

  private doPing() {
    log('ping')
    mqttClient().publish(PING_CHANNEL, 'p').catch((err) => {
      console.error('error publishing ping', err)
    })
  }
}

export default Pinger
