import { Encoder } from "cbor-x";
import { BytesLike, ContractTransaction, Signer, utils } from "ethers";
import { Database as DatabaseContract, Database__factory } from './typchain-types'

type Key = BytesLike
type ExpectedHash = BytesLike

class Database {
  private _signer:Signer
  private databaseContract:DatabaseContract
  private encoder:Encoder

  constructor(signer:Signer, databaseAddress:string) {
    this._signer = signer
    this.databaseContract = Database__factory.connect(databaseAddress, signer)
    this.encoder = new Encoder()
  }

  hashIdentifier(identifier:BytesLike):Key {
    return utils.solidityKeccak256(['bytes'], [identifier])
  }

  async get<T=any>(key:Key):Promise<[T, ExpectedHash]> {
    const [encodedValue, hash] = await this.databaseContract.get(key)
    return [this.encoder.decode(Buffer.from(encodedValue.slice(2))) as T, hash]
  }

  async set(key:Key, value:any, expectedHash:ExpectedHash):Promise<[ContractTransaction, ExpectedHash]> {
    const encodedValue = this.encoder.encode(value)
    const tx = await this.databaseContract.set(key, expectedHash, encodedValue)
    return [tx, this.hashIdentifier(encodedValue)]
  }

  async insert(key:Key, value:any):Promise<[ContractTransaction, ExpectedHash]> {
    const encodedValue = this.encoder.encode(value)
    const tx = await this.databaseContract.insert(key, encodedValue)
    return [tx, this.hashIdentifier(encodedValue)]  
  }


}

export default Database
