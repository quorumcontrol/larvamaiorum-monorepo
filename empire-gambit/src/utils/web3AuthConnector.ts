import { Chain, Connector, ConnectorData, normalizeChainId, UserRejectedRequestError } from "@wagmi/core";
import {
  ADAPTER_EVENTS,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import { ethers, Signer } from "ethers";
import { getAddress } from "ethers/lib/utils";
import log from "loglevel";
import web3auth from "./web3auth";

const IS_SERVER = typeof window === "undefined";

export class Web3AuthConnector extends Connector {
  ready = !IS_SERVER;

  readonly id = "web3Auth";

  readonly name = "web3Auth";

  provider?: SafeEventEmitterProvider;

  web3AuthInstance: Web3AuthCore;

  constructor(config: { chains?: Chain[]; options: any }) {
    super(config);
    this.web3AuthInstance = web3auth.instance
  }

  async connect(): Promise<Required<ConnectorData>> {
    try {
      this.emit("message", {
        type: "connecting",
      });

      // Check if there is a user logged in
      const isLoggedIn = await this.isAuthorized();
      console.log("already logged in: ", isLoggedIn)

      // if there is a user logged in, return the user
      if (isLoggedIn) {
        const provider = await this.getProvider();
        const chainId = await this.getChainId();
        if (provider.on) {
          provider.on("accountsChanged", this.onAccountsChanged.bind(this));
          provider.on("chainChanged", this.onChainChanged.bind(this));
        }
        const unsupported = this.isChainUnsupported(chainId);

        const ret = {
          provider,
          chain: {
            id: chainId,
            unsupported,
          },
          account: await this.getAccount(),
        };

        console.log("connecting: ", ret)

        return ret
      }

      return await new Promise((resolve, reject) => {
        this.web3AuthInstance.once(ADAPTER_EVENTS.CONNECTED, async () => {
          const signer = await this.getSigner();
          const account = (await signer.getAddress()) as `0x${string}`;
          const provider = await this.getProvider();

          if (provider.on) {
            provider.on("accountsChanged", this.onAccountsChanged.bind(this));
            provider.on("chainChanged", this.onChainChanged.bind(this));
          }
          const chainId = await this.getChainId();
          const unsupported = this.isChainUnsupported(chainId);

          return resolve({
            account,
            chain: {
              id: chainId,
              unsupported,
            },
            provider,
          });
        });
        this.web3AuthInstance.once(ADAPTER_EVENTS.ERRORED, (err: unknown) => {
          log.error("error while connecting", err);
          return reject(err);
        });
      });
    } catch (error) {
      log.error("error while connecting", error);
      throw new UserRejectedRequestError("Something went wrong");
    }
  }

  async getAccount(): Promise<`0x${string}`> {
    const provider = new ethers.providers.Web3Provider(await this.getProvider());
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    return account as `0x${string}`;
  }

  async getProvider() {
    if (this.provider) {
      return this.provider;
    }
    this.provider = this.web3AuthInstance.provider!;
    return this.provider;
  }

  async getSigner(): Promise<Signer> {
    const provider = new ethers.providers.Web3Provider(await this.getProvider());
    const signer = provider.getSigner();
    return signer;
  }

  async isAuthorized() {
    try {
      await web3auth.waitForReady()
      const account = await this.getAccount();
      return !!(account && this.provider);
    } catch {
      return false;
    }
  }

  async getChainId(): Promise<number> {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('missing provider')
      }
      const chainId = await provider.request({ method: "eth_chainId" });
      if (chainId) {
        return normalizeChainId(chainId as string);
      }

      throw new Error("Chain ID is not defined");
    } catch (error) {
      log.error("error", error);
      throw error;
    }
  }

  async switchChain(chainId: number):Promise<Chain> {
    console.error("attempting to switch chain")
    throw new Error('switch chain is not supported')
  }

  async disconnect(): Promise<void> {
    await this.web3AuthInstance.logout();
    this.provider = undefined;
  }

  protected onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) this.emit("disconnect");
    else this.emit("change", { account: getAddress(accounts[0]) });
  }

  protected isChainUnsupported(chainId: number): boolean {
    return false
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });
  }

  protected onDisconnect(): void {
    this.emit("disconnect");
  }
}
