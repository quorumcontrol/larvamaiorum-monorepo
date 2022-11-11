import { task } from 'hardhat/config'
import { BigNumber, utils } from 'ethers'
import fs from 'fs'
import YAML from 'yaml'
import glob from 'glob'
import path from 'path'

type Metadata = {name:string, description:string, originalId: number}
type MetadataArray = Metadata[]

const artworkBaseUrl = "ipfs://bafybeicu5kvyzhqhzanofonlzjwqnlcbph72nzsycmjxgwgwi6t6locnf4"

const ultraRare = [
  8,11,16,29,30,58,65,75,167,201,214,220,229
]

let randomTick = 0

const randomizer = "0x655fbe1616c67972a4a6222ac656de148ef75cc3ab1e50d04f306b24c69acbad"

function randomInt(max:number) {
  randomTick++
  return BigNumber.from(utils.keccak256(Buffer.from(`${randomizer}-${randomTick}`))).mod(max).toNumber()
}

function shuffleMetadata(masks:MetadataArray) {
  let curId = masks.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = randomInt(curId)
    curId -= 1;
    // Swap it with the current element.
    let tmp = masks[curId];
    masks[curId] = masks[randId];
    masks[randId] = tmp;
  }
  return masks;
}

async function getFileNames(pattern:string):Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, {}, function (err, files) {
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  })
}

type Rarity = 'ultra-rare' | 'rare' | 'uncommon'

function getRarity(i:number):Rarity {
  if (ultraRare.includes(i) ) {
    return 'ultra-rare'
  }
  if (randomInt(100) <= 10) {
    return 'rare'
  }
  return 'uncommon'
}



function jsonMetadata(tokenId:number, {name, description, originalId}:Metadata, artworkFilename:string) {
  const rarity = getRarity(originalId)
  return {
    name,
    description,
    tokenId,
    external_url: "https://cryptocolosseum.com/masks",
    image: `${artworkBaseUrl}/${artworkFilename}`,
    attributes: [{
      trait_type: "Rarity",
      value: rarity,
    }]
  }
}

task('create-metadata')
  .setAction(async (_, _hre) => {
    const descriptionPath = "./metadata/descriptions/alien_tungsten.yml"
    const file = fs.readFileSync(descriptionPath, 'utf8')
    const artwork = (await getFileNames('./MaskArt/cleaned/*.png')).map((fullPath:string) => {
      const name = path.basename(fullPath)
      return {
        id: parseInt(name.match(/^(\d+)[_-]/)![1]),
        fullPath: fullPath,
        name
      }
    }).sort((a,b) => {
      return a.id - b.id
    })

    const descriptions:MetadataArray = YAML.parse(file).alientungsten_masks.map((nameAndDescription:{name:string, description:string}, i:number) => {
      return {
        ...nameAndDescription,
        originalId: i,
      }
    })

    // descriptions.forEach((d, i) => {
    //   console.log(`${i}-${d.name} is ${artwork[i].fullPath}`)
    //   fs.writeFileSync(`./MaskArt/cleaned/${i}_${d.name.replace(/\W+/g, '_')}.png`, fs.readFileSync(artwork[i].fullPath))
    // })

    const shuffled = shuffleMetadata(descriptions)
    shuffled.forEach((description, i) => {
      fs.writeFileSync(`./metadata/bundle/${i}.json`, Buffer.from(JSON.stringify(jsonMetadata(i, description, artwork[description.originalId].name), null, '  ')))
    })
  })
