import { useEffect } from "react"
import { memoize } from "../utils/memoize"
import mqttClient, { NO_MORE_MOVES_CHANNEL, PING_CHANNEL, ROLLS_CHANNEL } from '../utils/mqtt'

const subscribeOnce = memoize(() => {
  return Promise.all([
    mqttClient().subscribe(ROLLS_CHANNEL, { qos: 2 }),
    mqttClient().subscribe(NO_MORE_MOVES_CHANNEL, { qos: 1 }),
    mqttClient().subscribe(PING_CHANNEL)
  ])
})

const useMqttMessages = (handler: (topic:string, payload:Buffer)=>any) => {

  useEffect(() => {
    const doAsync = async () => {
      await subscribeOnce()
    }
    doAsync()
  }, [])

  useEffect(() => {
    mqttClient().on('message', handler)
    return () => {
      mqttClient().off('message', handler)
    }
  }, [handler])

}

export default useMqttMessages