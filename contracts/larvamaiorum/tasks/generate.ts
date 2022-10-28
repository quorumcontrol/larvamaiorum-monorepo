import { task } from 'hardhat/config'
import YAML from 'yaml'
import fs from 'fs'
import { generate } from 'stability-client'


interface ApiImage {
  buffer: Buffer;
  filePath: string;
}

function generateImage(prompt:string) {
  return new Promise<ApiImage>((resolve, reject) => {

    const api = generate({
      prompt: prompt,
      engine: 'stable-diffusion-v1-5',
      diffusion: "k_dpm_2_ancestral",
      steps: 50,
      apiKey: process.env.DREAM_STUDIO_API_KEY!,
      cfgScale: 10,
    })
    
    api.on('image', (image) => {
      resolve(image)
    })
    
    api.on('end', (data) => {
      console.log('Generating Complete', data)
    })
  })
}

const colors = ['orange', 'green', 'purple', 'blue', 'yellow', 'red']

function promptFromNameAndDescription({name, description}:{name:string, description:string}) {
  const color = colors[Math.floor(Math.random() * colors.length)]
  return `the most beautiful photograph of a Roman ceremonial mask with glowing ${color} neon eyes and is called "${name}." unreal engine 5, octane render, crisp, intricate details, dark and moody.`
}

task('generate')
  .setAction(async (_, _hre) => {
    const path = "./metadata/descriptions/alien_tungsten.yml"
    const file = fs.readFileSync(path, 'utf8')
    const descriptions:{name:string, description:string}[] = YAML.parse(file).alientungsten_masks
    const directory = "./metadata/alien_tungsten"

    const offset = 200

    return Promise.all(descriptions.slice(offset,offset+50).map(async ({ name, description}, i) => {
      // const directory = `./metadata/alien_tungsten/${i}`
      // fs.mkdirSync(directory)
      const image = await generateImage(promptFromNameAndDescription({name, description}))
      // fs.writeFileSync(`${directory}/metadata.json`, Buffer.from(JSON.stringify({
      //   name,
      //   description,
      //   image: 'todo',
      //   attributes: [
      //     {
      //       "trait_type": "rarity", 
      //       "value": "TODO"
      //     }, 
      //   ]
      // }, null, 2)))
      console.log('finished', i, name)
      fs.renameSync(image.filePath, `${directory}/${offset+i}-${name}.png`)
      return image
    }))
  })
