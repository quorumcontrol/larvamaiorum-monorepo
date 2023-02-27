import api from 'api'

const sdk = api('@uberduck/v1.2#7pucwt1ql6jnykd4');

const key = process.env.UBERDUCK_KEY
const sk = process.env.UBERDUCK_SK

sdk.auth(key, sk);

const waitForSpeech = async (uuid: string) => {
    let response = await sdk.get_speak_status_speak_status_get({ uuid })

    while (!response.data.finished_at && !response.data.failed_at) {
        response = await new Promise((resolve) => setTimeout(() => {
            resolve(sdk.get_speak_status_speak_status_get({ uuid }))
        },
            500))
    }
    if (response.failed_at) {
        console.error("speech failed", response, response.data)
        throw new Error('Speech failed')
    }
    return response.data.path
}

export const speak = async (text: string) => {
    const initialResponse = await sdk.generate_speech_speak_post({
        voice: 'carolyn-speaking',
        pace: 1,
        speech: text.replace(/lead/g, 'leed'),
    }, { 'uberduck-id': 'anonymous' })

    const uuid = initialResponse.data.uuid

    return waitForSpeech(uuid)
}
