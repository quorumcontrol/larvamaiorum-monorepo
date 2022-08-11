import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TrustedForwarder__factory, Noncer__factory } from 'skale-relayer-contracts/lib/typechain-types'

const SERVICE = "delphstable.xyz";
const STATEMENT = "Your browser will send transactions to Delph's Table without requiring signatures.";
const URI = "https://delphstable.xyz";
const VERSION = "1";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const roller = await get('DiceRoller')

  console.log("bytecode: ", TrustedForwarder__factory.bytecode.length)

  const noncer = await deploy("Noncer", {
    from: deployer,
    log: true,
    contract: {
      bytecode: Noncer__factory.bytecode,
      abi: Noncer__factory.abi,
    },
    args: [roller.address]
  })

  await deploy("TrustedForwarder", {
    from: deployer,
    log: true,
    gasLimit: 2_700_000,
    contract: {
      bytecode: TrustedForwarder__factory.bytecode,
      abi: TrustedForwarder__factory.abi,
    },
    args: [
      noncer.address,
      SERVICE,
      STATEMENT,
      URI,
      VERSION
    ],
  });
};
export default func;
