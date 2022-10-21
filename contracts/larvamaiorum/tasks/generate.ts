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
      apiKey: process.env.DREAM_STUDIO_API_KEY!,
    })
    
    api.on('image', (image) => {
      resolve(image)
    })
    
    api.on('end', (data) => {
      console.log('Generating Complete', data)
    })
  })
}

function promptFromNameAndDescription({name, description}:{name:string, description:string}) {
  return `the most beautiful photograph of a Roman ceremonial mask. The mask has bright, glowing neon eyes and is called "${name}." unreal engine 5, octane render, crisp, intricate details, dark and moody, lens bloom. ${description}`
}

task('generate')
  .setAction(async (_, _hre) => {
    const path = "./metadata/descriptions/alien_tungsten.yml"
    const file = fs.readFileSync(path, 'utf8')
    const descriptions:{name:string, description:string}[] = YAML.parse(file).alientungsten_masks

    return Promise.all(descriptions.slice(0,10).map(async ({ name, description}, i) => {
      const directory = `./metadata/alien_tungsten/${i}`
      fs.mkdirSync(directory)
      const image = await generateImage(promptFromNameAndDescription({name, description}))
      fs.writeFileSync(`${directory}/metadata.json`, Buffer.from(JSON.stringify({
        name,
        description,
        image: 'todo',
        attributes: [
          {
            "trait_type": "rarity", 
            "value": "TODO"
          }, 
        ]
      }, null, 2)))
      console.log('finished', i, name)
      fs.renameSync(image.filePath, `${directory}/image.png`)
      return image
    }))

    console.log('done')

  })
