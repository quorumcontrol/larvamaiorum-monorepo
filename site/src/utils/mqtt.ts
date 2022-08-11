import mqtt, { IClientPublishOptions, IClientSubscribeOptions, MqttClient } from 'mqtt'
import { EventEmitter } from 'events'
import { memoize } from './memoize'
import { defaultNetwork } from './SkaleChains'
import debug from 'debug'

const log = debug('asyncMqtt')

const isBrowser = !(typeof window === 'undefined')

const ca = `-----BEGIN CERTIFICATE-----
MIIFnDCCA4SgAwIBAgIUKpECMfXJbkRCuGxENUzsysLWKTMwDQYJKoZIhvcNAQEN
BQAwZjELMAkGA1UEBhMCRlIxDjAMBgNVBAcTBVBhcmlzMREwDwYDVQQKEwhTY2Fs
ZXdheTEVMBMGA1UECxMMc2NhbGV3YXkuY29tMR0wGwYDVQQDExRpb3QuZnItcGFy
LnNjdy5jbG91ZDAeFw0xOTAyMTIwOTUyMDBaFw0yNDAyMTEwOTUyMDBaMGYxCzAJ
BgNVBAYTAkZSMQ4wDAYDVQQHEwVQYXJpczERMA8GA1UEChMIU2NhbGV3YXkxFTAT
BgNVBAsTDHNjYWxld2F5LmNvbTEdMBsGA1UEAxMUaW90LmZyLXBhci5zY3cuY2xv
dWQwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDK4OAYDjXiKl3bIRJB
INMz4TzACIP6LWDevnPFlBoTkzsfauACm4pXajig7E5xnCc4szNQN7vjr1RsjpAR
NDxeOu0B9TPjEnJ3XMKzANFhyiSPVJoex1Ko14XUEfbpIkRldrLvVLzvMuw/TPEO
GjY0/g+rjGNaIlnx08UNk2hZYO8RhnnoJnb+zlgYIQiZm2wvonI2j83Dn6PtRI4f
3qF2aTnppzuE+wBMjtVj0ge+ghQjCTBuR41zbNacAR2rGjvcAqxxRLma6R0KYdXE
SLE+Y6oXP8QAsr8+VVPUb8lrGqjQXAeibq7+fQvHjTSa9T6DjrWDf1QCt+ZSPkaM
EhOVDAVpQAef8gpkW0IWcFZI59EDI5vLhEBfL9TIMC2RT/QpN3gnIGCqqyvDgukX
ut3HWaPG3tx7hMxxICSBGBSnx//e38jRBrFoZqBnoBpvQuNs0k00duyHcsViVbXU
FmjTvN6Mi3Lwp08uo1N4+4p/L4jxdeBbqzRTs8MlRCzwQG2mCu5cktaBX4i6Drn/
p87DG5GuHVGBq9oIdc59TgN5ntazTEVbqYXTH0St+0xg0SQ+MNLlYi6JmC2fnx24
p2JD4JQVSTAewH0MbKSHWA1GqgTK+fS6NE2Xm03or4Z/iwM31jJ/lBz9TgJakYOW
2P0JBpS5alvjbADYVfsTJKnCcQIDAQABo0IwQDAOBgNVHQ8BAf8EBAMCAQYwDwYD
VR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUAkEEMpfh6BT9iSdEUOkBETaCXF0wDQYJ
KoZIhvcNAQENBQADggIBAEhehtLDG1jV259mFQPWMH2H79UmcREDZK/YUkGakMbI
NlZab5Te5Ln7OJ0tQoQhnIjSBFbtn2SGp+BK9DFQ9rtAC2BhcjGB3Z+a/HT1UkuP
QPtOixEbLtOchtjeU0VOEKu+/WkZP47uA+9123uh64+mcpxqEa+D1T9H5hlr+0e6
XuM3+BNgP+Ibj4mpKJvt2zhKbqDzgzHzpkKlJnSlD9CODB8hF30EtvYCZj+Laxr4
H0dnkBVeolVx8yEa0Udfc2POkZ8nno1OZbG+RddzHYc7N4KBojeOsP3yG4RyRzRW
U5gW4VkLHwcj9JZrqQwGQtDPltoGLW6CO9Amb1X1jpoFftbX/P9BrBLDV6qh5D2g
BYlic6+80Gvl35YOouoptxWm1EGDCOXVf1/HTc6HMJqJ4PUda7y1XT6vri+F6KVj
T01qD0xC0oeV+I0bRaYYTjO2Bbni2zuOOY2mqhqixU0xGEf4cTD7CS24KCqu+vA1
oI1Wufs9j39RP/7mkmzBnhTkwSW6Idif1z6nJCzz3VEbPBVKjS2yJmtN1qbdD4pf
3xBVhMgaAM403ixirIohY65fPNi7myQSls/zdC9PFi08Up4LSqA370YJ6RqNcCZu
g6euS0Asw3r+fzgj6MkXoHLf++f29Essdpb1BczuohUAtHZ71M/e8QjB32qLX0fi
-----END CERTIFICATE-----`

const URL = isBrowser ? 'wss://websocket.iot.fr-par.scw.cloud/mqtt' : 'mqtts://iot.fr-par.scw.cloud'

class AsyncMqtt extends EventEmitter {

  client:MqttClient
  connected:Promise<any>

  constructor(client:MqttClient) {
    super()
    this.client = client
    this.connected = new Promise<void>((resolve) => {
      this.client.once('connect', () => {
      log("mqtt connected")
        resolve()
      })
    })
    this.client.on('message', (topic, payload, packet) => {
      this.emit('message', topic, Buffer.from(payload), packet)
    })
    this.client.on('error', (err) => {
      console.error('mqtt err', err)
    })
  }

  async subscribe(channel:string, opts:IClientSubscribeOptions = { qos: 0 }) {
    await this.connected
    return new Promise<void>((resolve,reject) => {
      this.client.subscribe(channel, opts, (err) => {
        if (err) {
          return reject(err)
        }
        log('subscribed: ', channel)
        resolve()
      })
    })
  }

  async publish(channel:string, msg:string|Buffer, opts?:IClientPublishOptions) {
    await this.connected
    return new Promise<void>((resolve,reject) => {
      this.client.publish(channel, msg, opts || {}, (err) => {
        if (err) {
          reject(err)
          true
        }
        log('published: ', channel)
        resolve()
      })
    })
  }
}

export const NO_MORE_MOVES_CHANNEL = `/delphs-table-${defaultNetwork().id}/no-more-moves`
export const ROLLS_CHANNEL = `/delphs-table-${defaultNetwork().id}/rolls`
export const PING_CHANNEL = `/delphs-table-${defaultNetwork().id}/ping`

const asyncClient = memoize(() => {
  log('mqtt connecting, ', isBrowser)
  const key = isBrowser ? process.env.NEXT_PUBLIC_DELPHS_BROWSER_KEY?.replace(/_/g, "\n") : process.env.DELPHS_ORCHESTRATOR_KEY
  const cert = isBrowser ? process.env.NEXT_PUBLIC_DELPHS_BROWSER_CERT?.replace(/_/g, "\n") : process.env.DELPHS_ORCHESTRATOR_CERT
  const username = isBrowser ? process.env.NEXT_PUBLIC_DELPHS_BROWSER_MQTT_USERNAME : process.env.DELPHS_ORCHESTRATOR_MQTT_USERNAME

  if (!key || !cert || !username) {
    throw new Error('must have an mqtt key, cert, username')
  }

  return new AsyncMqtt(mqtt.connect(URL, {
    username,
    ca,
    key,
    cert,
    rejectUnauthorized: true,
  }));
})

export default asyncClient

