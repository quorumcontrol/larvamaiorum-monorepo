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
    inputs: [],
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
  "0x60a060405260006001556000600255600160035534801561001f57600080fd5b50604051610d93380380610d9383398101604081905261003e9161004f565b6001600160a01b031660805261007f565b60006020828403121561006157600080fd5b81516001600160a01b038116811461007857600080fd5b9392505050565b608051610cf961009a60003960006102290152610cf96000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80630f3d724d1461005157806361b1da8614610066578063dbd42da514610079578063f522843314610097575b600080fd5b61006461005f366004610ada565b6100ae565b005b610064610074366004610af3565b61021e565b61008161028f565b60405161008e9190610b2b565b60405180910390f35b6100a06101f481565b60405190815260200161008e565b60008167ffffffffffffffff8111156100c9576100c9610b78565b6040519080825280602002602001820160405280156100f2578160200160208202803683370190505b50905060005b82811015610177576101306040518060400160405280600e81526020016d033b2ba1038bab2bab2b21030ba160951b815250826104bb565b61013b600582610504565b82828151811061014d5761014d610b8e565b6001600160a01b03909216602092830291909101909101528061016f81610bba565b9150506100f8565b50805160005b8181101561021057600083828151811061019957610199610b8e565b602002602001015190506101cc6040518060400160405280600781526020016672616e6b696e6760c81b81525082610519565b6001600160a01b0381166000908152600460205260409020546101f090829061055e565b6101fb600582610692565b5050808061020890610bba565b91505061017d565b506102196106a7565b505050565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461026757604051634312da9f60e01b815260040160405180910390fd5b610272600583610730565b506001600160a01b03909116600090815260046020526040902055565b60035460609060006102a2600183610bd3565b67ffffffffffffffff8111156102ba576102ba610b78565b6040519080825280602002602001820160405280156102e3578160200160208202803683370190505b50604080516080810182527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5546001600160a01b031681527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb6546020808301919091527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb7548284018190527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb85460609093019290925260008281529081905291822092935091905b6103b6600186610bd3565b8110156104b157815484516001600160a01b03909116908590839081106103df576103df610b8e565b60200260200101906001600160a01b031690816001600160a01b03168152505061042d6040518060400160405280600c81526020016b33b2ba103732bc3a103337b960a11b815250846104bb565b6040805160808101825283546001600160a01b03168152600184015460208083019190915260028501548284018190526003909501546060909201919091526000848152808252829020825180840190935260048352631b995e1d60e21b9183019190915292935061049f90846104bb565b806104a981610bba565b9150506103ab565b5091949350505050565b61050082826040516024016104d1929190610c37565b60408051601f198184030181529190526020810180516001600160e01b03166309710a9d60e41b179052610745565b5050565b60006105108383610766565b90505b92915050565b610500828260405160240161052f929190610c59565b60408051601f198184030181529190526020810180516001600160e01b031663319af33360e01b179052610745565b8060000361059a57610500604051806040016040528060138152602001723d32b937903130b630b731b2903932ba3ab93760691b815250610790565b6101f4600354101580156105c1575060025460009081526020819052604090206001015481105b15610604576105006040518060400160405280601e81526020017f5f636f756e74206f72206c6f7765722062616c616e63652072657475726e0000815250610790565b6001600160a01b038216600090815260076020526040902054610626906107d6565b60008061063283610874565b915091506106646040518060400160405280600c81526020016b34b739b2b93a1030b33a32b960a11b815250836104bb565b610670828286866108e1565b6001600160a01b03909416600090815260076020526040902093909355505050565b6000610510836001600160a01b038416610998565b6003546101f481116106b65750565b60006106c46101f483610bd3565b60025460008181526020819052604081209293509091905b8381101561070e576003820154600081815260208190526040902090935091508061070681610bba565b9150506106dc565b5060006002808301919091558290556107278385610bd3565b60035550505050565b6000610510836001600160a01b038416610a8b565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b600082600001828154811061077d5761077d610b8e565b9060005260206000200154905092915050565b6107d3816040516024016107a49190610c83565b60408051601f198184030181529190526020810180516001600160e01b031663104c13eb60e21b179052610745565b50565b806000036107e15750565b600081815260208181526040808320600380820154808652838620845160808101865284546001600160a01b031681526001850154818801526002808601548288018190526060909201849052818952968890529490962085870185905591820181905593549194929186036108575760028490555b6003805490600061086783610c96565b9190505550505050505050565b6002546000818152602081815260408083208151808301909252600c82526b6265666f7265207768696c6560a01b928201929092526108b290610790565b83816001015410156108d957600301546000818152602081905260409020909250826108b2575b919391925050565b60018054600091826108f283610bba565b90915550604080516080810182526001600160a01b038681168252602080830187815260028a81018054868801908152606087018e81529189905560008981529485905296909320855181546001600160a01b0319169516949094178455905160018401559351938201939093559151600392830155908601549192509061097a5760028290555b6003805490600061098a83610bba565b919050555050949350505050565b60008181526001830160205260408120548015610a815760006109bc600183610bd3565b85549091506000906109d090600190610bd3565b9050818114610a355760008660000182815481106109f0576109f0610b8e565b9060005260206000200154905080876000018481548110610a1357610a13610b8e565b6000918252602080832090910192909255918252600188019052604090208390555b8554869080610a4657610a46610cad565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610513565b6000915050610513565b6000818152600183016020526040812054610ad257508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610513565b506000610513565b600060208284031215610aec57600080fd5b5035919050565b60008060408385031215610b0657600080fd5b82356001600160a01b0381168114610b1d57600080fd5b946020939093013593505050565b6020808252825182820181905260009190848201906040850190845b81811015610b6c5783516001600160a01b031683529284019291840191600101610b47565b50909695505050505050565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201610bcc57610bcc610ba4565b5060010190565b600082821015610be557610be5610ba4565b500390565b6000815180845260005b81811015610c1057602081850181015186830182015201610bf4565b81811115610c22576000602083870101525b50601f01601f19169290920160200192915050565b604081526000610c4a6040830185610bea565b90508260208301529392505050565b604081526000610c6c6040830185610bea565b905060018060a01b03831660208301529392505050565b6020815260006105106020830184610bea565b600081610ca557610ca5610ba4565b506000190190565b634e487b7160e01b600052603160045260246000fdfea2646970667358221220a010008228544d0c5ddbacb54e6b01caa9a6594ce071cdf9756465c38fa15ec464736f6c634300080e0033";

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
