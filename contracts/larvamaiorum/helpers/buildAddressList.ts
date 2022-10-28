import fs from 'fs'
import path  from 'path'

const deploymentDir = `${__dirname}/../deployments`

function isDir(path:string) {
  return fs.lstatSync(path).isDirectory()
}

function isFile(path:string) {
  return fs.lstatSync(path).isFile()
}

function networkDirectories() {
  return fs.readdirSync(deploymentDir)
  .filter((name) => !name.startsWith('.'))
  .map((dir) => path.join(deploymentDir, dir))
  .filter(isDir)
}

function contractDeployments(networkDirectory:string) {
  return fs.readdirSync(networkDirectory)
  .filter((name) => !name.startsWith('.'))
  .map((contractFile) => path.join(networkDirectory, contractFile))
  .filter(isFile)
}

function addressesForDirectory(networkDirectory: string) {
  const addresses:Record<string,string> = {}
  const files = contractDeployments(networkDirectory)
  files.forEach((file) => {
    const deployment = JSON.parse(fs.readFileSync(file).toString('utf8'))
    addresses[path.basename(file).replace('.json', '')] = deployment.address
  })
  return addresses
}

export default function buildAddressList() {
  networkDirectories().forEach((networkDirectory) => {
    console.log('building address file for', networkDirectory)
    const addresses = addressesForDirectory(networkDirectory)
    const addressFile = path.join(networkDirectory, 'addresses.json')
    fs.writeFileSync(addressFile, Buffer.from(JSON.stringify(addresses)))
  })
}