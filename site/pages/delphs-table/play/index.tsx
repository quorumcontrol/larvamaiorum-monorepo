import { Box, Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import LoggedInLayout from "../../../src/components/LoggedInLayout";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import { useRelayer } from "../../../src/hooks/useUser";
import promiseWaiter from "../../../src/utils/promiseWaiter";
import SingletonQueue from "../../../src/utils/singletonQueue";
import useGameRunner from "../../../src/hooks/gameRunner";
import GameOverScreen from "../../../src/components/GameOverScreen";
import { useRegisterInterest, useWaitForTable } from "../../../src/hooks/Lobby";
import { usePlayCardMutation } from "../../../src/hooks/useDelphsTable";
import items from "../../../src/boardLogic/items";

const txQueue = new SingletonQueue();

interface GameEvent {
  type: string;
  data: any;
}

const Play: NextPage = () => {
  const router = useRouter();
  const { tableId: untypedTableId } = router.query;

  const [tableId, setTableId] = useState(untypedTableId as string | undefined);
  const mutation = usePlayCardMutation(tableId);

  const { address } = useAccount();
  const { data: relayer } = useRelayer();
  const isClient = useIsClientSide();
  const iframe = useRef<HTMLIFrameElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const registerInterestMutation = useRegisterInterest();
  const { data: gameRunner, over } = useGameRunner(
    tableId,
    address,
    iframe.current || undefined,
    ready
  );

  useEffect(() => {
    setTableId(untypedTableId as string | undefined);
  }, [untypedTableId, setTableId]);

  const sendToIframe = useCallback(
    (msg: any) => {
      iframe.current?.contentWindow?.postMessage(JSON.stringify(msg), "*");
    },
    [iframe]
  );

  const handleTableRunning = useCallback(
    (tableId?: string) => {
      if (!tableId) {
        throw new Error("received table running without tableid");
      }
      console.log("table ready");
      setTableId(tableId);

      if (typeof window !== "undefined" && window.history) {
        window.history.pushState(
          null,
          "Crypto Colosseum: Delph's Table",
          `/delphs-table/play?tableId=${tableId}`
        );
      }
    },
    [setTableId]
  );

  useWaitForTable(handleTableRunning);

  useEffect(() => {
    return () => {
      console.log("unmounted the play page");
      if (gameRunner) {
        gameRunner.stop();
      }
    };
  }, [gameRunner]);

  const handleFullScreenMessage = useCallback(() => {
    setFullScreen((old) => {
      const newState = !old;
      if (newState) {
        iframe.current?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      return !old;
    });
  }, [setFullScreen]);

  const handlePlayCardMessage = useCallback(
    async (evt: GameEvent) => {
      console.log("handle play card: ", evt);
      const name: "theieve" | "berserk" = evt.data.name;
      const item = items.find(
        (i) => i.name.toLowerCase() === name.toLowerCase()
      );
      if (!item) {
        throw new Error("item not found in the UI layer");
      }
      mutation.mutateAsync({ address: item.address, id: item.id });
    },
    [mutation]
  );

  const handleMessage = useCallback(
    async (appEvent: GameEvent) => {
      if (!relayer?.ready()) {
        throw new Error("no relayer");
      }
      if (!tableId) {
        throw new Error("no tableId");
      }

      console.log("params", tableId, appEvent.data);
      txQueue.push(async () => {
        await promiseWaiter(500); // try to fix a broken nonce issue
        const delphsTable = relayer.wrapped.delphsTable();
        const tx = await delphsTable.setDestination(
          tableId,
          appEvent.data.destination[0],
          appEvent.data.destination[1],
          { gasLimit: 250000 }
        ); // normally around 80k
        console.log("--------------- destination tx: ", tx);
        return await tx
          .wait()
          .then((receipt) => {
            console.log("------------ destination receipt: ", receipt);
          })
          .catch((err) => {
            console.error("----------- error with destinationSetter", err);
          });
      });
    },
    [tableId, relayer]
  );

  useEffect(() => {
    const handler = async (evt: MessageEvent) => {
      if (evt.origin === "https://playcanv.as") {
        const appEvent: GameEvent = JSON.parse(evt.data);
        switch (appEvent.type) {
          case "pending_dest":
            console.log("set destination received", appEvent);
            await handleMessage(appEvent);
            break;
          case "fullScreenClick":
            return handleFullScreenMessage();
          case "card_click":
            return handlePlayCardMessage(appEvent);
          case "loaded":
            console.log("we got a loaded!");
            if (!tableId) {
              registerInterestMutation.mutate({ addr: address! });
            }
            return setReady(true);
          default:
            console.log("unhandled message from iframe: ", appEvent);
        }
      }
    };
    console.log("add iframe msg listener");
    window.addEventListener("message", handler);
    return () => {
      console.log("removing iframe msg listener");
      window.removeEventListener("message", handler);
    };
  }, [
    handleMessage,
    handleFullScreenMessage,
    handlePlayCardMessage,
    sendToIframe,
    address,
    registerInterestMutation,
    tableId,
  ]);

  return (
    <>
      <LoggedInLayout>
        <Flex direction={["column", "column", "column", "row"]}>
          <Box minW="100%">
            {isClient && !over && (
              <Box
                id="game"
                as="iframe"
                // src={`https://playcanv.as/e/b/d5i364yY/?player=${address}`}
                src={`https://playcanv.as/e/b/33949233`}
                ref={iframe}
                top="0"
                left="0"
                w="100%"
                minH= "70vh"

                // w={fullScreen ? "100vw" : "100%"}
                // minH={fullScreen ? "100vh" : "70vh"}
                // position={fullScreen ? "fixed" : undefined}
              />
            )}
            {isClient && over && (
              <GameOverScreen player={address} runner={gameRunner} />
            )}
          </Box>
        </Flex>
      </LoggedInLayout>
    </>
  );
};

export default Play;
