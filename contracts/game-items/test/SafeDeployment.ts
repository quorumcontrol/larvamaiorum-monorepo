import { expect } from "chai"
import { SafeRelayer, WalletDeployer__factory } from "@skaleboarder/safe-tools";
import { deployments } from "hardhat";

describe("SafeDeployments", () => {
  const setupTest = deployments.createFixture(
    async ({ deployments, getNamedAccounts, ethers }) => {
        await deployments.fixture(); // ensure you start from a fresh deployments
        const deploys = await deployments.all()

        const { deployer: deployerAddress } = await getNamedAccounts();
        const deployer = await ethers.getSigner(deployerAddress)
        const signers = await ethers.getSigners()

        const chainId = await deployer.provider!.getNetwork().then(n => n.chainId)

        const contractNetworks = {
            [chainId]: {
                safeMasterCopyAddress: deploys.GnosisSafe.address,
                safeProxyFactoryAddress: deploys.GnosisSafeProxyFactory.address,
                multiSendAddress: deploys.MultiSend.address,
                multiSendCallOnlyAddress: deploys.MultiSendCallOnly.address,
                fallbackHandlerAddress: deploys.CompatibilityFallbackHandler.address,
                signMessageLibAddress: deploys.SignMessageLib.address,
                createCallAddress: deploys.CreateCall.address,
            }
        }

        const walletDeployer = WalletDeployer__factory.connect(deploys.WalletDeployer.address, deployer)

        const relayer = new SafeRelayer({
            ethers,
            signer: signers[1],
            walletDeployerAddress: walletDeployer.address,
            EnglishOwnerAdderAddress: deploys.EnglishOwnerAdder.address,
            networkConfig: contractNetworks,
            provider: deployer.provider!,
            faucet: async (address: string) => {
                await (await deployer.sendTransaction({
                    to: address,
                    value: ethers.utils.parseEther("2")
                })).wait()
            }
        })

        // we need to do this within the fixture so that the safe is created before the test runs
        // and when the state is snapshotted it all works.
        await relayer.ready

        const playerProfile = await (await ethers.getContractFactory("PlayerProfile")).deploy(deployer.address)
        await playerProfile.deployed()

        return { deployer, signers, walletDeployer, deploys, contractNetworks, relayer, chainId, playerProfile }
    }
);

it("executes wrapped transactions", async () => {
    const { relayer, playerProfile } = await setupTest()
    
    const wrapped = relayer.wrappedSigner()
    const tx = await playerProfile.connect(wrapped).safeMint({
      name: "alice",
      image: "https://example.com/alice.png",
      description: "alice is a cool person",
      animationUrl: "https://example.com/alice.gif",
    })
    await tx.wait()
    expect(await playerProfile.ownerOf(0)).to.equal((await relayer.safe).getAddress())
});
})