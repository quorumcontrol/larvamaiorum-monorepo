import { task } from 'hardhat/config'
import YAML from 'yaml'
import fs from 'fs'

task('generate')
  .setAction(async (_, _hre) => {
    const path = "./metadata/descriptions/alien_tungsten.yml"
    const file = fs.readFileSync(path, 'utf8')
    const descriptions:{name:string, description:string}[] = YAML.parse(file).alientungsten_masks
    console.log(descriptions.slice(0,1))
  })
