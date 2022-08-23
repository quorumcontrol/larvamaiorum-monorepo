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
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface HitchensOrderStatisticsTreeLibInterface
  extends ethers.utils.Interface {
  functions: {
    "below(HitchensOrderStatisticsTreeLib.Tree storage,uint256)": FunctionFragment;
    "above(HitchensOrderStatisticsTreeLib.Tree storage,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "below",
    values: [any, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "above",
    values: [any, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "below", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "above", data: BytesLike): Result;

  events: {};
}

export class HitchensOrderStatisticsTreeLib extends BaseContract {
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

  interface: HitchensOrderStatisticsTreeLibInterface;

  functions: {
    below(
      self: any,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { _below: BigNumber }>;

    above(
      self: any,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { _above: BigNumber }>;
  };

  below(
    self: any,
    value: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  above(
    self: any,
    value: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    below(
      self: any,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    above(
      self: any,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    below(
      self: any,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    above(
      self: any,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    below(
      self: any,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    above(
      self: any,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
