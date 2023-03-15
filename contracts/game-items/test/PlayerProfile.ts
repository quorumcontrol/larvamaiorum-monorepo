import { expect } from "chai"
import { deployments, ethers } from "hardhat"
import { PlayerProfile__factory } from "../typechain-types"

describe.only("PlayerProfile", () => {
    const setupTest = deployments.createFixture(
        async ({ deployments, ethers }) => {
            await deployments.fixture(); // ensure you start from a fresh deployments

            const signers = await ethers.getSigners()
            const deployer = signers[0]
            const deploys = await deployments.all()

            const playerProfile = PlayerProfile__factory.connect(deploys.PlayerProfile.address, deployer)

            return {
                signers,
                deployer,
                playerProfile,
            }
        }
    )

    it("deploys a small enough contract", async () => {
        const deployer = (await ethers.getSigners())[0]
        const fact = await ethers.getContractFactory("PlayerProfile")
        expect(Buffer.from(fact.bytecode.slice(2), "hex").byteLength).to.be.lessThan(24576)
        const player = await fact.deploy(deployer.address)
        await player.deployed()
    })

    it("can get the balance of a user", async () => {
        const { playerProfile, deployer } = await setupTest()

        expect(await playerProfile.balanceOf(deployer.address)).to.equal(0)
    })

})