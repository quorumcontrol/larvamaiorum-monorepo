/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ListKeeper, ListKeeperInterface } from "../ListKeeper";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "trustedForwarder",
        type: "address",
      },
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AlreadyUsed",
    type: "error",
  },
  {
    inputs: [],
    name: "Unauthorized",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "list",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "entry",
        type: "bytes32",
      },
    ],
    name: "EntryAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    inputs: [],
    name: "ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "list",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "entry",
        type: "bytes32",
      },
    ],
    name: "add",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "list",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "entry",
        type: "bytes32",
      },
    ],
    name: "contains",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "forwarder",
        type: "address",
      },
    ],
    name: "isTrustedForwarder",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "list",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "tableId",
        type: "bytes32",
      },
    ],
    name: "remove",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60a06040523480156200001157600080fd5b5060405162000e1c38038062000e1c8339810160408190526200003491620001a9565b6001600160a01b0382166080526200006d7fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c217758262000082565b6200007a60008262000082565b5050620001e1565b6200008e828262000092565b5050565b6000828152602081815260408083206001600160a01b038516845290915290205460ff166200008e576000828152602081815260408083206001600160a01b03851684529091529020805460ff19166001179055620000f062000134565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b60006200014b6200015060201b620004a01760201c565b905090565b6080516000906001600160a01b0316330362000173575060131936013560601c90565b6200014b6200018860201b620004e91760201c565b3390565b80516001600160a01b0381168114620001a457600080fd5b919050565b60008060408385031215620001bd57600080fd5b620001c8836200018c565b9150620001d8602084016200018c565b90509250929050565b608051610c18620002046000396000818161014a01526104a40152610c186000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806375b238fc1161007157806375b238fc1461018d57806391d14854146101b4578063a217fddf146101c7578063b10e4172146101cf578063d1de592a146101e2578063d547741f146101f557600080fd5b806301ffc9a7146100b9578063248a9ca3146100e15780632f2ff15d1461011257806336568abe14610127578063572b6c051461013a5780635bf2a4e91461017a575b600080fd5b6100cc6100c7366004610985565b610208565b60405190151581526020015b60405180910390f35b6101046100ef3660046109af565b60009081526020819052604090206001015490565b6040519081526020016100d8565b6101256101203660046109e4565b61023f565b005b6101256101353660046109e4565b610269565b6100cc610148366004610a10565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0390811691161490565b6100cc610188366004610a2b565b6102fc565b6101047fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c2177581565b6100cc6101c23660046109e4565b61031b565b610104600081565b6100cc6101dd366004610a2b565b610344565b6100cc6101f0366004610a2b565b6103ae565b6101256102033660046109e4565b61047b565b60006001600160e01b03198216637965db0b60e01b148061023957506301ffc9a760e01b6001600160e01b03198316145b92915050565b60008281526020819052604090206001015461025a816104ed565b6102648383610501565b505050565b610271610586565b6001600160a01b0316816001600160a01b0316146102ee5760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084015b60405180910390fd5b6102f88282610590565b5050565b60008281526001602052604081206103149083610613565b9392505050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b60006103707fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c217753361031b565b61038c576040516282b42960e81b815260040160405180910390fd5b60008381526001602052604090206103a4908361062b565b5060019392505050565b60006103da7fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c217753361031b565b6103f6576040516282b42960e81b815260040160405180910390fd5b600083815260016020526040902061040e9083610613565b1561042c576040516307b8c82160e41b815260040160405180910390fd5b60008381526001602052604090206104449083610637565b50604051829084907fecaece1baa9832206284a232c40f9fd53f893568d34c7e9ac2de8b4c9490beae90600090a350600192915050565b600082815260208190526040902060010154610496816104ed565b6102648383610590565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036104df575060131936013560601c90565b503390565b905090565b3390565b6104fe816104f9610586565b610643565b50565b61050b828261031b565b6102f8576000828152602081815260408083206001600160a01b03851684529091529020805460ff19166001179055610542610586565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b60006104e46104a0565b61059a828261031b565b156102f8576000828152602081815260408083206001600160a01b03851684529091529020805460ff191690556105cf610586565b6001600160a01b0316816001600160a01b0316837ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a45050565b60008181526001830160205260408120541515610314565b600061031483836106a7565b6000610314838361079a565b61064d828261031b565b6102f857610665816001600160a01b031660146107e9565b6106708360206107e9565b604051602001610681929190610a7d565b60408051601f198184030181529082905262461bcd60e51b82526102e591600401610af2565b600081815260018301602052604081205480156107905760006106cb600183610b3b565b85549091506000906106df90600190610b3b565b90508181146107445760008660000182815481106106ff576106ff610b52565b906000526020600020015490508087600001848154811061072257610722610b52565b6000918252602080832090910192909255918252600188019052604090208390555b855486908061075557610755610b68565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610239565b6000915050610239565b60008181526001830160205260408120546107e157508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610239565b506000610239565b606060006107f8836002610b7e565b610803906002610b9d565b67ffffffffffffffff81111561081b5761081b610bb5565b6040519080825280601f01601f191660200182016040528015610845576020820181803683370190505b509050600360fc1b8160008151811061086057610860610b52565b60200101906001600160f81b031916908160001a905350600f60fb1b8160018151811061088f5761088f610b52565b60200101906001600160f81b031916908160001a90535060006108b3846002610b7e565b6108be906001610b9d565b90505b6001811115610936576f181899199a1a9b1b9c1cb0b131b232b360811b85600f16601081106108f2576108f2610b52565b1a60f81b82828151811061090857610908610b52565b60200101906001600160f81b031916908160001a90535060049490941c9361092f81610bcb565b90506108c1565b5083156103145760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016102e5565b60006020828403121561099757600080fd5b81356001600160e01b03198116811461031457600080fd5b6000602082840312156109c157600080fd5b5035919050565b80356001600160a01b03811681146109df57600080fd5b919050565b600080604083850312156109f757600080fd5b82359150610a07602084016109c8565b90509250929050565b600060208284031215610a2257600080fd5b610314826109c8565b60008060408385031215610a3e57600080fd5b50508035926020909101359150565b60005b83811015610a68578181015183820152602001610a50565b83811115610a77576000848401525b50505050565b7f416363657373436f6e74726f6c3a206163636f756e7420000000000000000000815260008351610ab5816017850160208801610a4d565b7001034b99036b4b9b9b4b733903937b6329607d1b6017918401918201528351610ae6816028840160208801610a4d565b01602801949350505050565b6020815260008251806020840152610b11816040850160208701610a4d565b601f01601f19169190910160400192915050565b634e487b7160e01b600052601160045260246000fd5b600082821015610b4d57610b4d610b25565b500390565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052603160045260246000fd5b6000816000190483118215151615610b9857610b98610b25565b500290565b60008219821115610bb057610bb0610b25565b500190565b634e487b7160e01b600052604160045260246000fd5b600081610bda57610bda610b25565b50600019019056fea264697066735822122004f3c236403d0340d20ad39a30ed3080b6716370ff82109f7edaa5746f609b0f64736f6c634300080e0033";

export class ListKeeper__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    trustedForwarder: string,
    initialOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ListKeeper> {
    return super.deploy(
      trustedForwarder,
      initialOwner,
      overrides || {}
    ) as Promise<ListKeeper>;
  }
  getDeployTransaction(
    trustedForwarder: string,
    initialOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      trustedForwarder,
      initialOwner,
      overrides || {}
    );
  }
  attach(address: string): ListKeeper {
    return super.attach(address) as ListKeeper;
  }
  connect(signer: Signer): ListKeeper__factory {
    return super.connect(signer) as ListKeeper__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ListKeeperInterface {
    return new utils.Interface(_abi) as ListKeeperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ListKeeper {
    return new Contract(address, _abi, signerOrProvider) as ListKeeper;
  }
}
