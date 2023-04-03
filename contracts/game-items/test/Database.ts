import { expect } from "chai"
import { deployments, ethers } from "hardhat"
import { Database__factory, PlayerProfile__factory } from "../typechain-types"
import { utils } from "ethers"
const { solidityKeccak256 } = utils

describe.only("Database", () => {
    const setupTest = deployments.createFixture(
        async ({ deployments, ethers }) => {
            await deployments.fixture(); // ensure you start from a fresh deployments

            const signers = await ethers.getSigners()
            const deployer = signers[0]
            const deploys = await deployments.all()

            const database = Database__factory.connect(deploys.Database.address, deployer)

            return {
                signers,
                deployer,
                database,
            }
        }
    )

    it("deploys a small enough contract", async () => {
        const deployer = (await ethers.getSigners())[0]
        const fact = await ethers.getContractFactory("Database")
        expect(Buffer.from(fact.bytecode.slice(2), "hex").byteLength).to.be.lessThan(24576)
        const player = await fact.deploy(deployer.address)
        await player.deployed()
    })

    it("inserts", async () => {
        const { database } = await setupTest()
        const key = solidityKeccak256(["uint256"], [1])
        const data = Buffer.from("hello world")
        await expect(database.insert(key, data)).to.emit(database, "Inserted")

        const [readData] = await database.get(key)
        expect(readData).to.equal(utils.hexlify(data))
    })

    it('sets when updating with correct hash', async () => {
      const { database } = await setupTest()
      const key = solidityKeccak256(["uint256"], [1])
      const data = Buffer.from("hello world")
      await expect(database.insert(key, data)).to.emit(database, "Inserted")

      const expectedHash = solidityKeccak256(["bytes"], [data])

      const newData = Buffer.from("hello space")

      await expect(database.set(key, expectedHash, newData)).to.emit(database, "Set")

      const [readData, hash] = await database.get(key)
      expect(readData).to.equal(utils.hexlify(newData))
    })

})