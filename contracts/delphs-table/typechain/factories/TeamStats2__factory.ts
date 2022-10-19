/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { TeamStats2, TeamStats2Interface } from "../TeamStats2";

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
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "team",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "tableId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "value",
        type: "int256",
      },
    ],
    name: "TeamWin",
    type: "event",
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
    name: "SENDER_ROLE",
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
        components: [
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "team",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "tableId",
            type: "bytes32",
          },
          {
            internalType: "int256",
            name: "value",
            type: "int256",
          },
        ],
        internalType: "struct TeamStats2.BulkEmit[]",
        name: "evts",
        type: "tuple[]",
      },
    ],
    name: "register",
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
  "0x60a060405234801561001057600080fd5b5060405162000c0838038062000c0883398101604081905261003191610187565b6001600160a01b03821660805261004960008261007a565b6100737f76d12de99ad2ca162840505be9b657c2e7a650cc3ee0284048f3f9def3c1adf28261007a565b50506101ba565b6000828152602081815260408083206001600160a01b038516845290915290205460ff16610116576000828152602081815260408083206001600160a01b03851684529091529020805460ff191660011790556100d561011a565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b600061012e61013360201b6103df1760201c565b905090565b6080516000906001600160a01b03163303610155575060131936013560601c90565b61012e61016760201b6104281760201c565b3390565b80516001600160a01b038116811461018257600080fd5b919050565b6000806040838503121561019a57600080fd5b6101a38361016b565b91506101b16020840161016b565b90509250929050565b608051610a2b620001dd6000396000818161013401526103e30152610a2b6000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063768606c011610066578063768606c01461016457806391d1485414610177578063a217fddf1461018a578063c42ef38c14610192578063d547741f146101b957600080fd5b806301ffc9a7146100a3578063248a9ca3146100cb5780632f2ff15d146100fc57806336568abe14610111578063572b6c0514610124575b600080fd5b6100b66100b1366004610759565b6101cc565b60405190151581526020015b60405180910390f35b6100ee6100d9366004610783565b60009081526020819052604090206001015490565b6040519081526020016100c2565b61010f61010a3660046107b8565b610203565b005b61010f61011f3660046107b8565b61022d565b6100b66101323660046107e4565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0390811691161490565b61010f6101723660046107ff565b6102c0565b6100b66101853660046107b8565b610391565b6100ee600081565b6100ee7f76d12de99ad2ca162840505be9b657c2e7a650cc3ee0284048f3f9def3c1adf281565b61010f6101c73660046107b8565b6103ba565b60006001600160e01b03198216637965db0b60e01b14806101fd57506301ffc9a760e01b6001600160e01b03198316145b92915050565b60008281526020819052604090206001015461021e8161042c565b6102288383610440565b505050565b6102356104c5565b6001600160a01b0316816001600160a01b0316146102b25760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084015b60405180910390fd5b6102bc82826104cf565b5050565b7f76d12de99ad2ca162840505be9b657c2e7a650cc3ee0284048f3f9def3c1adf26102ea8161042c565b8160005b8181101561038a573685858381811061030957610309610874565b608002919091019150506020810180359061032490836107e4565b6001600160a01b03167f3ee43ef954d666bf5ca0169f2df10be0195842ad234e29f1dca0060ddc96edf68360400135846060013560405161036f929190918252602082015260400190565b60405180910390a35080610382816108a0565b9150506102ee565b5050505050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b6000828152602081905260409020600101546103d58161042c565b61022883836104cf565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316330361041e575060131936013560601c90565b503390565b905090565b3390565b61043d816104386104c5565b610552565b50565b61044a8282610391565b6102bc576000828152602081815260408083206001600160a01b03851684529091529020805460ff191660011790556104816104c5565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b60006104236103df565b6104d98282610391565b156102bc576000828152602081815260408083206001600160a01b03851684529091529020805460ff1916905561050e6104c5565b6001600160a01b0316816001600160a01b0316837ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a45050565b61055c8282610391565b6102bc57610574816001600160a01b031660146105b6565b61057f8360206105b6565b6040516020016105909291906108e9565b60408051601f198184030181529082905262461bcd60e51b82526102a99160040161095e565b606060006105c5836002610991565b6105d09060026109b0565b67ffffffffffffffff8111156105e8576105e86109c8565b6040519080825280601f01601f191660200182016040528015610612576020820181803683370190505b509050600360fc1b8160008151811061062d5761062d610874565b60200101906001600160f81b031916908160001a905350600f60fb1b8160018151811061065c5761065c610874565b60200101906001600160f81b031916908160001a9053506000610680846002610991565b61068b9060016109b0565b90505b6001811115610703576f181899199a1a9b1b9c1cb0b131b232b360811b85600f16601081106106bf576106bf610874565b1a60f81b8282815181106106d5576106d5610874565b60200101906001600160f81b031916908160001a90535060049490941c936106fc816109de565b905061068e565b5083156107525760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016102a9565b9392505050565b60006020828403121561076b57600080fd5b81356001600160e01b03198116811461075257600080fd5b60006020828403121561079557600080fd5b5035919050565b80356001600160a01b03811681146107b357600080fd5b919050565b600080604083850312156107cb57600080fd5b823591506107db6020840161079c565b90509250929050565b6000602082840312156107f657600080fd5b6107528261079c565b6000806020838503121561081257600080fd5b823567ffffffffffffffff8082111561082a57600080fd5b818501915085601f83011261083e57600080fd5b81358181111561084d57600080fd5b8660208260071b850101111561086257600080fd5b60209290920196919550909350505050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000600182016108b2576108b261088a565b5060010190565b60005b838110156108d45781810151838201526020016108bc565b838111156108e3576000848401525b50505050565b7f416363657373436f6e74726f6c3a206163636f756e74200000000000000000008152600083516109218160178501602088016108b9565b7001034b99036b4b9b9b4b733903937b6329607d1b60179184019182015283516109528160288401602088016108b9565b01602801949350505050565b602081526000825180602084015261097d8160408501602087016108b9565b601f01601f19169190910160400192915050565b60008160001904831182151516156109ab576109ab61088a565b500290565b600082198211156109c3576109c361088a565b500190565b634e487b7160e01b600052604160045260246000fd5b6000816109ed576109ed61088a565b50600019019056fea2646970667358221220ed6c82ac08cb3c0fffd27bde335939d7bba18e5750d74717b10bf4b2ca628def64736f6c634300080e0033";

export class TeamStats2__factory extends ContractFactory {
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
  ): Promise<TeamStats2> {
    return super.deploy(
      trustedForwarder,
      initialOwner,
      overrides || {}
    ) as Promise<TeamStats2>;
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
  attach(address: string): TeamStats2 {
    return super.attach(address) as TeamStats2;
  }
  connect(signer: Signer): TeamStats2__factory {
    return super.connect(signer) as TeamStats2__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TeamStats2Interface {
    return new utils.Interface(_abi) as TeamStats2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TeamStats2 {
    return new Contract(address, _abi, signerOrProvider) as TeamStats2;
  }
}