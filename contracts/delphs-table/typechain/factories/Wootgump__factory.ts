/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Wootgump, WootgumpInterface } from "../Wootgump";

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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
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
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
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
    name: "MINTER_ROLE",
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
    name: "PAUSER_ROLE",
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
    name: "RANKER_SETTER_ROLE",
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
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
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
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
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct Wootgump.BulkMint[]",
        name: "mintInfo",
        type: "tuple[]",
      },
    ],
    name: "bulkMint",
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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
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
    inputs: [],
    name: "ranker",
    outputs: [
      {
        internalType: "contract IRanker",
        name: "",
        type: "address",
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
        internalType: "address",
        name: "rankerAddress",
        type: "address",
      },
    ],
    name: "setRanker",
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
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
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
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
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
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60a06040523480156200001157600080fd5b5060405162001c5338038062001c5383398101604081905262000034916200030b565b60408051808201825260088152670576f6f7467756d760c41b602080830191825283518085019094526004845263047554d560e41b90840152815185939162000081916003919062000248565b5080516200009790600490602084019062000248565b50506005805460ff19169055506001600160a01b0316608052620000bd60008262000149565b620000e97f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a8262000149565b620001157f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a68262000149565b620001417fcc1b8cadd533d925892769e8ce23bece5a558c4de433ae5822943be7f6b82e2a8262000149565b50506200037f565b60008281526006602090815260408083206001600160a01b038516845290915290205460ff16620001ec5760008281526006602090815260408083206001600160a01b03851684529091529020805460ff19166001179055620001ab620001f0565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b6000620002076200020c60201b6200099f1760201c565b905090565b6080516000906001600160a01b031633036200022f575060131936013560601c90565b620002076200024460201b620009e81760201c565b3390565b828054620002569062000343565b90600052602060002090601f0160209004810192826200027a5760008555620002c5565b82601f106200029557805160ff1916838001178555620002c5565b82800160010185558215620002c5579182015b82811115620002c5578251825591602001919060010190620002a8565b50620002d3929150620002d7565b5090565b5b80821115620002d35760008155600101620002d8565b80516001600160a01b03811681146200030657600080fd5b919050565b600080604083850312156200031f57600080fd5b6200032a83620002ee565b91506200033a60208401620002ee565b90509250929050565b600181811c908216806200035857607f821691505b6020821081036200037957634e487b7160e01b600052602260045260246000fd5b50919050565b6080516118b1620003a26000396000818161033001526109a301526118b16000f3fe608060405234801561001057600080fd5b50600436106101e55760003560e01c8063572b6c051161010f57806395d89b41116100a2578063d539139311610071578063d53913931461044a578063d547741f14610471578063dd62ed3e14610484578063e63ab1e91461049757600080fd5b806395d89b4114610414578063a217fddf1461041c578063a457c2d714610424578063a9059cbb1461043757600080fd5b806379cc6790116100de57806379cc6790146103bf5780637a3c27ea146103d25780638456cb59146103f957806391d148541461040157600080fd5b8063572b6c05146103205780635c975abb146103605780636be94b951461036b57806370a082311461039657600080fd5b80632f2ff15d11610187578063395093511161015657806339509351146102df5780633f4ba83a146102f257806340c10f19146102fa57806342966c681461030d57600080fd5b80632f2ff15d14610297578063313ce567146102aa57806333d98fd9146102b957806336568abe146102cc57600080fd5b806312706304116101c3578063127063041461023a57806318160ddd1461024f57806323b872dd14610261578063248a9ca31461027457600080fd5b806301ffc9a7146101ea57806306fdde0314610212578063095ea7b314610227575b600080fd5b6101fd6101f8366004611502565b6104be565b60405190151581526020015b60405180910390f35b61021a6104f5565b6040516102099190611558565b6101fd6102353660046115a7565b610587565b61024d6102483660046115d1565b6105a9565b005b6002545b604051908152602001610209565b6101fd61026f3660046115ec565b6105f6565b610253610282366004611628565b60009081526006602052604090206001015490565b61024d6102a5366004611641565b610624565b60405160128152602001610209565b6101fd6102c736600461166d565b61064e565b61024d6102da366004611641565b6106f0565b6101fd6102ed3660046115a7565b610783565b61024d6107af565b61024d6103083660046115a7565b6107e4565b61024d61031b366004611628565b610818565b6101fd61032e3660046115d1565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0390811691161490565b60055460ff166101fd565b60075461037e906001600160a01b031681565b6040516001600160a01b039091168152602001610209565b6102536103a43660046115d1565b6001600160a01b031660009081526020819052604090205490565b61024d6103cd3660046115a7565b610829565b6102537fcc1b8cadd533d925892769e8ce23bece5a558c4de433ae5822943be7f6b82e2a81565b61024d610845565b6101fd61040f366004611641565b610877565b61021a6108a2565b610253600081565b6101fd6104323660046115a7565b6108b1565b6101fd6104453660046115a7565b610937565b6102537f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a681565b61024d61047f366004611641565b61094f565b6102536104923660046116e2565b610974565b6102537f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a81565b60006001600160e01b03198216637965db0b60e01b14806104ef57506301ffc9a760e01b6001600160e01b03198316145b92915050565b6060600380546105049061170c565b80601f01602080910402602001604051908101604052809291908181526020018280546105309061170c565b801561057d5780601f106105525761010080835404028352916020019161057d565b820191906000526020600020905b81548152906001019060200180831161056057829003601f168201915b5050505050905090565b6000806105926109ec565b905061059f8185856109f6565b5060019392505050565b7fcc1b8cadd533d925892769e8ce23bece5a558c4de433ae5822943be7f6b82e2a6105d381610b1a565b50600780546001600160a01b0319166001600160a01b0392909216919091179055565b6000806106016109ec565b905061060e858285610b2b565b610619858585610ba5565b506001949350505050565b60008281526006602052604090206001015461063f81610b1a565b6106498383610d79565b505050565b60007f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a661067a81610b1a565b8260005b818110156106e4576106d286868381811061069b5761069b611746565b6106b192602060409092020190810191506115d1565b8787848181106106c3576106c3611746565b90506040020160200135610e00565b806106dc81611772565b91505061067e565b50600195945050505050565b6106f86109ec565b6001600160a01b0316816001600160a01b0316146107755760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084015b60405180910390fd5b61077f8282610ee7565b5050565b60008061078e6109ec565b905061059f8185856107a08589610974565b6107aa919061178b565b6109f6565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a6107d981610b1a565b6107e1610f6c565b50565b7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a661080e81610b1a565b6106498383610e00565b6107e16108236109ec565b82611005565b61083b826108356109ec565b83610b2b565b61077f8282611005565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a61086f81610b1a565b6107e161115a565b60009182526006602090815260408084206001600160a01b0393909316845291905290205460ff1690565b6060600480546105049061170c565b6000806108bc6109ec565b905060006108ca8286610974565b90508381101561092a5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b606482015260840161076c565b61061982868684036109f6565b6000806109426109ec565b905061059f818585610ba5565b60008281526006602052604090206001015461096a81610b1a565b6106498383610ee7565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036109de575060131936013560601c90565b503390565b905090565b3390565b60006109e361099f565b6001600160a01b038316610a585760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b606482015260840161076c565b6001600160a01b038216610ab95760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b606482015260840161076c565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6107e181610b266109ec565b6111d6565b6000610b378484610974565b90506000198114610b9f5781811015610b925760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000604482015260640161076c565b610b9f84848484036109f6565b50505050565b6001600160a01b038316610c095760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b606482015260840161076c565b6001600160a01b038216610c6b5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b606482015260840161076c565b6001600160a01b03831660009081526020819052604090205481811015610ce35760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b606482015260840161076c565b6001600160a01b03808516600090815260208190526040808220858503905591851681529081208054849290610d1a90849061178b565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610d6691815260200190565b60405180910390a3610b9f84848461123a565b610d838282610877565b61077f5760008281526006602090815260408083206001600160a01b03851684529091529020805460ff19166001179055610dbc6109ec565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6001600160a01b038216610e565760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640161076c565b8060026000828254610e68919061178b565b90915550506001600160a01b03821660009081526020819052604081208054839290610e9590849061178b565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a361077f6000838361123a565b610ef18282610877565b1561077f5760008281526006602090815260408083206001600160a01b03851684529091529020805460ff19169055610f286109ec565b6001600160a01b0316816001600160a01b0316837ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a45050565b60055460ff16610fb55760405162461bcd60e51b815260206004820152601460248201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b604482015260640161076c565b6005805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa610fe86109ec565b6040516001600160a01b03909116815260200160405180910390a1565b6001600160a01b0382166110655760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b606482015260840161076c565b6001600160a01b038216600090815260208190526040902054818110156110d95760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b606482015260840161076c565b6001600160a01b03831660009081526020819052604081208383039055600280548492906111089084906117a3565b90915550506040518281526000906001600160a01b038516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a36106498360008461123a565b60055460ff16156111a05760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b604482015260640161076c565b6005805460ff191660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258610fe86109ec565b6111e08282610877565b61077f576111f8816001600160a01b0316601461135f565b61120383602061135f565b6040516020016112149291906117ba565b60408051601f198184030181529082905262461bcd60e51b825261076c91600401611558565b6007546001600160a01b03166361b1da868461126b816001600160a01b031660009081526020819052604090205490565b6040516001600160e01b031960e085901b1681526001600160a01b0390921660048301526024820152604401600060405180830381600087803b1580156112b157600080fd5b505af11580156112c5573d6000803e3d6000fd5b50506007546001600160a01b031691506361b1da869050846112fc856001600160a01b031660009081526020819052604090205490565b6040516001600160e01b031960e085901b1681526001600160a01b0390921660048301526024820152604401600060405180830381600087803b15801561134257600080fd5b505af1158015611356573d6000803e3d6000fd5b50505050505050565b6060600061136e83600261182f565b61137990600261178b565b67ffffffffffffffff8111156113915761139161184e565b6040519080825280601f01601f1916602001820160405280156113bb576020820181803683370190505b509050600360fc1b816000815181106113d6576113d6611746565b60200101906001600160f81b031916908160001a905350600f60fb1b8160018151811061140557611405611746565b60200101906001600160f81b031916908160001a905350600061142984600261182f565b61143490600161178b565b90505b60018111156114ac576f181899199a1a9b1b9c1cb0b131b232b360811b85600f166010811061146857611468611746565b1a60f81b82828151811061147e5761147e611746565b60200101906001600160f81b031916908160001a90535060049490941c936114a581611864565b9050611437565b5083156114fb5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e74604482015260640161076c565b9392505050565b60006020828403121561151457600080fd5b81356001600160e01b0319811681146114fb57600080fd5b60005b8381101561154757818101518382015260200161152f565b83811115610b9f5750506000910152565b602081526000825180602084015261157781604085016020870161152c565b601f01601f19169190910160400192915050565b80356001600160a01b03811681146115a257600080fd5b919050565b600080604083850312156115ba57600080fd5b6115c38361158b565b946020939093013593505050565b6000602082840312156115e357600080fd5b6114fb8261158b565b60008060006060848603121561160157600080fd5b61160a8461158b565b92506116186020850161158b565b9150604084013590509250925092565b60006020828403121561163a57600080fd5b5035919050565b6000806040838503121561165457600080fd5b823591506116646020840161158b565b90509250929050565b6000806020838503121561168057600080fd5b823567ffffffffffffffff8082111561169857600080fd5b818501915085601f8301126116ac57600080fd5b8135818111156116bb57600080fd5b8660208260061b85010111156116d057600080fd5b60209290920196919550909350505050565b600080604083850312156116f557600080fd5b6116fe8361158b565b91506116646020840161158b565b600181811c9082168061172057607f821691505b60208210810361174057634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000600182016117845761178461175c565b5060010190565b6000821982111561179e5761179e61175c565b500190565b6000828210156117b5576117b561175c565b500390565b7f416363657373436f6e74726f6c3a206163636f756e74200000000000000000008152600083516117f281601785016020880161152c565b7001034b99036b4b9b9b4b733903937b6329607d1b601791840191820152835161182381602884016020880161152c565b01602801949350505050565b60008160001904831182151516156118495761184961175c565b500290565b634e487b7160e01b600052604160045260246000fd5b6000816118735761187361175c565b50600019019056fea2646970667358221220c19b36213dabc6217a6232f214c956f6fb0d619264ccc196a72db393630baacd64736f6c634300080e0033";

export class Wootgump__factory extends ContractFactory {
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
  ): Promise<Wootgump> {
    return super.deploy(
      trustedForwarder,
      initialOwner,
      overrides || {}
    ) as Promise<Wootgump>;
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
  attach(address: string): Wootgump {
    return super.attach(address) as Wootgump;
  }
  connect(signer: Signer): Wootgump__factory {
    return super.connect(signer) as Wootgump__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WootgumpInterface {
    return new utils.Interface(_abi) as WootgumpInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Wootgump {
    return new Contract(address, _abi, signerOrProvider) as Wootgump;
  }
}
