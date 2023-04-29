import dotenv from 'dotenv'
dotenv.config({
    path: "development.env"
  })
import { speak } from '../src/ai/googleTTS'


const main = async () => {
    try {
        const data = await speak("Baobab Experience: Baobab Experience is a grassroots organization that provides emergency assistance to migrants and refugees who arrive in Rome. They offer legal advice, medical care, and practical support, such as food and shelter.")
        return data
    } catch(err) {
        console.error(err)
    }
}

main().then((data) => {
    console.log("data", data)
}).catch((err) => {
    console.error('oops', err)
    process.exit(1)
})
