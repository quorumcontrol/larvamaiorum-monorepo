/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface RankerInterface extends ethers.utils.Interface {
  functions: {
    "MAX_RANKINGS()": FunctionFragment;
    "clearRankingQueue(uint256)": FunctionFragment;
    "pendingRankings(uint256)": FunctionFragment;
    "queueRanking(address,uint256)": FunctionFragment;
    "ranked(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "MAX_RANKINGS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "clearRankingQueue",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "pendingRankings",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "queueRanking",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "ranked",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "MAX_RANKINGS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "clearRankingQueue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pendingRankings",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "queueRanking",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "ranked", data: BytesLike): Result;

  events: {};
}

export class Ranker extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: RankerInterface;

  functions: {
    MAX_RANKINGS(overrides?: CallOverrides): Promise<[BigNumber]>;

    clearRankingQueue(
      max: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    pendingRankings(
      max: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    queueRanking(
      user: string,
      balance: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    ranked(
      userMax: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string[]]>;
  };

  MAX_RANKINGS(overrides?: CallOverrides): Promise<BigNumber>;

  clearRankingQueue(
    max: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  pendingRankings(
    max: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  queueRanking(
    user: string,
    balance: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  ranked(userMax: BigNumberish, overrides?: CallOverrides): Promise<string[]>;

  callStatic: {
    MAX_RANKINGS(overrides?: CallOverrides): Promise<BigNumber>;

    clearRankingQueue(
      max: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    pendingRankings(
      max: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    queueRanking(
      user: string,
      balance: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    ranked(userMax: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
  };

  filters: {};

  estimateGas: {
    MAX_RANKINGS(overrides?: CallOverrides): Promise<BigNumber>;

    clearRankingQueue(
      max: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    pendingRankings(
      max: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    queueRanking(
      user: string,
      balance: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    ranked(
      userMax: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    MAX_RANKINGS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    clearRankingQueue(
      max: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    pendingRankings(
      max: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    queueRanking(
      user: string,
      balance: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    ranked(
      userMax: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
