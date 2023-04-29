/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { Database, DatabaseInterface } from "../../contracts/Database";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "initialAdmin",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AlreadyExistsError",
    type: "error",
  },
  {
    inputs: [],
    name: "ConflictError",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
    ],
    name: "Inserted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
    ],
    name: "Removed",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
    ],
    name: "Set",
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
    inputs: [],
    name: "WRITER",
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
        name: "key",
        type: "bytes32",
      },
    ],
    name: "get",
    outputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "hash",
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
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
    ],
    name: "insert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
    ],
    name: "remove",
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
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "existingHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
    ],
    name: "set",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610f1a380380610f1a83398101604081905261002f91610133565b6100597fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c2177582610094565b6100837f73a9985316cd4cbfd13dadcaa0e6f773c85e933a0d88efbe60e4dc49da9176a082610094565b61008e600082610094565b50610163565b6000828152602081815260408083206001600160a01b038516845290915290205460ff1661012f576000828152602081815260408083206001600160a01b03851684529091529020805460ff191660011790556100ee3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b60006020828403121561014557600080fd5b81516001600160a01b038116811461015c57600080fd5b9392505050565b610da8806101726000396000f3fe608060405234801561001057600080fd5b50600436106100af5760003560e01c806301ffc9a7146100b4578063248a9ca3146100dc57806327c50f7d146100fd5780632f2ff15d1461011257806336568abe146101255780633aa38bb21461013857806375b238fc1461014d5780638eaa6ac01461017457806391d148541461019557806395bc2673146101a8578063a217fddf146101bb578063a4f3a603146101c3578063d547741f146101d6575b600080fd5b6100c76100c236600461091f565b6101e9565b60405190151581526020015b60405180910390f35b6100ef6100ea366004610949565b610220565b6040519081526020016100d3565b61011061010b3660046109aa565b610235565b005b6101106101203660046109fc565b6102f8565b6101106101333660046109fc565b610319565b6100ef600080516020610d5383398151915281565b6100ef7fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c2177581565b610187610182366004610949565b61039c565b6040516100d3929190610a88565b6100c76101a33660046109fc565b610451565b6101106101b6366004610949565b61047a565b6100ef600081565b6101106101d1366004610aaa565b6104e5565b6101106101e43660046109fc565b6105b2565b60006001600160e01b03198216637965db0b60e01b148061021a57506301ffc9a760e01b6001600160e01b03198316145b92915050565b60009081526020819052604090206001015490565b600080516020610d5383398151915261024d816105ce565b600085815260026020526040902054841461027b57604051631b2162e360e31b815260040160405180910390fd5b6000838360405161028d929190610af5565b604080519182900390912060008881526001602052919091209091506102b4848683610ba3565b5060008681526002602052604080822083905551829188917fbe36e676e2bd60008e254589c61b0a78dd7621bea5f3f349919148754049d98f9190a3505050505050565b61030182610220565b61030a816105ce565b61031483836105db565b505050565b6001600160a01b038116331461038e5760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084015b60405180910390fd5b610398828261065f565b5050565b60008181526001602090815260408083206002909252822054815460609392919082906103c890610b1b565b80601f01602080910402602001604051908101604052809291908181526020018280546103f490610b1b565b80156104415780601f1061041657610100808354040283529160200191610441565b820191906000526020600020905b81548152906001019060200180831161042457829003601f168201915b5050505050915091509150915091565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b600080516020610d53833981519152610492816105ce565b60008281526001602052604081206104a9916108d1565b6000828152600260205260408082208290555183917fc258b116f380657d67061f79c25e784314e0e1ed9b52630fac916654db63499891a25050565b600080516020610d538339815191526104fd816105ce565b6000848152600160205260409020805461051690610b1b565b1590506105365760405163eb73dbfd60e01b815260040160405180910390fd5b60008383604051610548929190610af5565b6040805191829003909120600087815260016020529190912090915061056f848683610ba3565b5060008581526002602052604080822083905551829187917f02ba1deb6630c4e4b6d96065fb072960a205a0883189ee6e453df2c25b41b9ba9190a35050505050565b6105bb82610220565b6105c4816105ce565b610314838361065f565b6105d881336106c4565b50565b6105e58282610451565b610398576000828152602081815260408083206001600160a01b03851684529091529020805460ff1916600117905561061b3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6106698282610451565b15610398576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b6106ce8282610451565b610398576106db8161071d565b6106e683602061072f565b6040516020016106f7929190610c63565b60408051601f198184030181529082905262461bcd60e51b825261038591600401610cd2565b606061021a6001600160a01b03831660145b6060600061073e836002610cfb565b610749906002610d12565b6001600160401b0381111561076057610760610b05565b6040519080825280601f01601f19166020018201604052801561078a576020820181803683370190505b509050600360fc1b816000815181106107a5576107a5610d25565b60200101906001600160f81b031916908160001a905350600f60fb1b816001815181106107d4576107d4610d25565b60200101906001600160f81b031916908160001a90535060006107f8846002610cfb565b610803906001610d12565b90505b600181111561087b576f181899199a1a9b1b9c1cb0b131b232b360811b85600f166010811061083757610837610d25565b1a60f81b82828151811061084d5761084d610d25565b60200101906001600160f81b031916908160001a90535060049490941c9361087481610d3b565b9050610806565b5083156108ca5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610385565b9392505050565b5080546108dd90610b1b565b6000825580601f106108ed575050565b601f0160209004906000526020600020908101906105d891905b8082111561091b5760008155600101610907565b5090565b60006020828403121561093157600080fd5b81356001600160e01b0319811681146108ca57600080fd5b60006020828403121561095b57600080fd5b5035919050565b60008083601f84011261097457600080fd5b5081356001600160401b0381111561098b57600080fd5b6020830191508360208285010111156109a357600080fd5b9250929050565b600080600080606085870312156109c057600080fd5b843593506020850135925060408501356001600160401b038111156109e457600080fd5b6109f087828801610962565b95989497509550505050565b60008060408385031215610a0f57600080fd5b8235915060208301356001600160a01b0381168114610a2d57600080fd5b809150509250929050565b60005b83811015610a53578181015183820152602001610a3b565b50506000910152565b60008151808452610a74816020860160208601610a38565b601f01601f19169290920160200192915050565b604081526000610a9b6040830185610a5c565b90508260208301529392505050565b600080600060408486031215610abf57600080fd5b8335925060208401356001600160401b03811115610adc57600080fd5b610ae886828701610962565b9497909650939450505050565b8183823760009101908152919050565b634e487b7160e01b600052604160045260246000fd5b600181811c90821680610b2f57607f821691505b602082108103610b4f57634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111561031457600081815260208120601f850160051c81016020861015610b7c5750805b601f850160051c820191505b81811015610b9b57828155600101610b88565b505050505050565b6001600160401b03831115610bba57610bba610b05565b610bce83610bc88354610b1b565b83610b55565b6000601f841160018114610c025760008515610bea5750838201355b600019600387901b1c1916600186901b178355610c5c565b600083815260209020601f19861690835b82811015610c335786850135825560209485019460019092019101610c13565b5086821015610c505760001960f88860031b161c19848701351681555b505060018560011b0183555b5050505050565b76020b1b1b2b9b9a1b7b73a3937b61d1030b1b1b7bab73a1604d1b815260008351610c95816017850160208801610a38565b7001034b99036b4b9b9b4b733903937b6329607d1b6017918401918201528351610cc6816028840160208801610a38565b01602801949350505050565b6020815260006108ca6020830184610a5c565b634e487b7160e01b600052601160045260246000fd5b808202811582820484141761021a5761021a610ce5565b8082018082111561021a5761021a610ce5565b634e487b7160e01b600052603260045260246000fd5b600081610d4a57610d4a610ce5565b50600019019056fe73a9985316cd4cbfd13dadcaa0e6f773c85e933a0d88efbe60e4dc49da9176a0a26469706673582212204a2f952340b8f435af4eb0f94be3efe75a9303d55bfb7ca50679aad5f612d53d64736f6c63430008120033";

type DatabaseConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DatabaseConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Database__factory extends ContractFactory {
  constructor(...args: DatabaseConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    initialAdmin: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Database> {
    return super.deploy(initialAdmin, overrides || {}) as Promise<Database>;
  }
  override getDeployTransaction(
    initialAdmin: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(initialAdmin, overrides || {});
  }
  override attach(address: string): Database {
    return super.attach(address) as Database;
  }
  override connect(signer: Signer): Database__factory {
    return super.connect(signer) as Database__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DatabaseInterface {
    return new utils.Interface(_abi) as DatabaseInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Database {
    return new Contract(address, _abi, signerOrProvider) as Database;
  }
}