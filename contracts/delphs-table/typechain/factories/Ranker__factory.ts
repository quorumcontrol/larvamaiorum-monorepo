/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Ranker, RankerInterface } from "../Ranker";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "wootgumpContractAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "FourOhOneUnauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "MAX_RANKINGS",
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
        internalType: "uint256",
        name: "max",
        type: "uint256",
      },
    ],
    name: "clearRankingQueue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "max",
        type: "uint256",
      },
    ],
    name: "pendingRankings",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    name: "queueRanking",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "userMax",
        type: "uint256",
      },
    ],
    name: "ranked",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405260006001556000600255600160035534801561001f57600080fd5b50604051610bcf380380610bcf83398101604081905261003e9161004f565b6001600160a01b031660805261007f565b60006020828403121561006157600080fd5b81516001600160a01b038116811461007857600080fd5b9392505050565b608051610b3561009a60003960006102040152610b356000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80630f3d724d1461005c57806361b1da8614610071578063a05837ca14610084578063b2bfce2c146100ad578063f5228433146100c0575b600080fd5b61006f61006a3660046109c2565b6100d7565b005b61006f61007f3660046109db565b6101f9565b6100976100923660046109c2565b61026a565b6040516100a49190610a13565b60405180910390f35b6100976100bb3660046109c2565b61043b565b6100c96101f481565b6040519081526020016100a4565b60008167ffffffffffffffff8111156100f2576100f2610a60565b60405190808252806020026020018201604052801561011b578160200160208202803683370190505b50905060005b82811015610170576101346005826104f5565b82828151811061014657610146610a76565b6001600160a01b03909216602092830291909101909101528061016881610aa2565b915050610121565b50805160005b818110156101eb57600083828151811061019257610192610a76565b602002602001015190506101cb8160046000846001600160a01b03166001600160a01b0316815260200190815260200160002054610508565b6101d66005826105a4565b505080806101e390610aa2565b915050610176565b506101f46105b9565b505050565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461024257604051634312da9f60e01b815260040160405180910390fd5b61024d600583610642565b506001600160a01b03909116600090815260046020526040902055565b606060008083116102895760016003546102849190610abb565b61028b565b825b905060008167ffffffffffffffff8111156102a8576102a8610a60565b6040519080825280602002602001820160405280156102d1578160200160208202803683370190505b50604080516080810182527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5546001600160a01b031681527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb6546020808301919091527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb7548284018190527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb85460609093019290925260008281529081905291822092935091905b8481101561043057815484516001600160a01b03909116908590839081106103c3576103c3610a76565b6001600160a01b0392831660209182029290920181019190915260408051608081018252855490931683526001850154838301526002850154838201819052600390950154606090930192909252600084815290819052209192508061042881610aa2565b915050610399565b509195945050505050565b6060816000036104555761044f6005610657565b92915050565b60008267ffffffffffffffff81111561047057610470610a60565b604051908082528060200260200182016040528015610499578160200160208202803683370190505b50905060005b838110156104ee576104b26005826104f5565b8282815181106104c4576104c4610a76565b6001600160a01b0390921660209283029190910190910152806104e681610aa2565b91505061049f565b5092915050565b60006105018383610664565b9392505050565b6001600160a01b03821660009081526007602052604090205461052a9061068e565b80600003610536575050565b6101f46003541015801561055d575060025460009081526020819052604090206001015481105b15610566575050565b6000806105728361072c565b915091506105828282868661076d565b6001600160a01b03909416600090815260076020526040902093909355505050565b6000610501836001600160a01b038416610824565b6003546101f481116105c85750565b60006105d66101f483610abb565b60025460008181526020819052604081209293509091905b83811015610620576003820154600081815260208190526040902090935091508061061881610aa2565b9150506105ee565b5060006002808301919091558290556106398385610abb565b60035550505050565b6000610501836001600160a01b038416610917565b6060600061050183610966565b600082600001828154811061067b5761067b610a76565b9060005260206000200154905092915050565b806000036106995750565b600081815260208181526040808320600380820154808652838620845160808101865284546001600160a01b0316815260018501548188015260028086015482880181905260609092018490528189529688905294909620858701859055918201819055935491949291860361070f5760028490555b6003805490600061071f83610ad2565b9190505550505050505050565b60025460008181526020819052604081205b8381600101541015610765576003015460008181526020819052604090209092508261073e575b919391925050565b600180546000918261077e83610aa2565b90915550604080516080810182526001600160a01b038681168252602080830187815260028a81018054868801908152606087018e81529189905560008981529485905296909320855181546001600160a01b031916951694909417845590516001840155935193820193909355915160039283015590860154919250906108065760028290555b6003805490600061081683610aa2565b919050555050949350505050565b6000818152600183016020526040812054801561090d576000610848600183610abb565b855490915060009061085c90600190610abb565b90508181146108c157600086600001828154811061087c5761087c610a76565b906000526020600020015490508087600001848154811061089f5761089f610a76565b6000918252602080832090910192909255918252600188019052604090208390555b85548690806108d2576108d2610ae9565b60019003818190600052602060002001600090559055856001016000868152602001908152602001600020600090556001935050505061044f565b600091505061044f565b600081815260018301602052604081205461095e5750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915561044f565b50600061044f565b6060816000018054806020026020016040519081016040528092919081815260200182805480156109b657602002820191906000526020600020905b8154815260200190600101908083116109a2575b50505050509050919050565b6000602082840312156109d457600080fd5b5035919050565b600080604083850312156109ee57600080fd5b82356001600160a01b0381168114610a0557600080fd5b946020939093013593505050565b6020808252825182820181905260009190848201906040850190845b81811015610a545783516001600160a01b031683529284019291840191600101610a2f565b50909695505050505050565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201610ab457610ab4610a8c565b5060010190565b600082821015610acd57610acd610a8c565b500390565b600081610ae157610ae1610a8c565b506000190190565b634e487b7160e01b600052603160045260246000fdfea264697066735822122034d54eef18d97b679a78965a43b3be35678d7b3c379768be44f33a9610f241ea64736f6c634300080e0033";

export class Ranker__factory extends ContractFactory {
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
    wootgumpContractAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Ranker> {
    return super.deploy(
      wootgumpContractAddress,
      overrides || {}
    ) as Promise<Ranker>;
  }
  getDeployTransaction(
    wootgumpContractAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(wootgumpContractAddress, overrides || {});
  }
  attach(address: string): Ranker {
    return super.attach(address) as Ranker;
  }
  connect(signer: Signer): Ranker__factory {
    return super.connect(signer) as Ranker__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RankerInterface {
    return new utils.Interface(_abi) as RankerInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Ranker {
    return new Contract(address, _abi, signerOrProvider) as Ranker;
  }
}