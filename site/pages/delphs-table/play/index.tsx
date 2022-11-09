import { Box, Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import LoggedInLayout from "../../../src/components/LoggedInLayout";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import { useRelayer } from "../../../src/hooks/useUser";
import useGameRunner from "../../../src/hooks/firebaseGameRunner";
import GameOverScreen from "../../../src/components/GameOverScreen";
import { useRegisterInterest, useWaitForTable } from "../../../src/hooks/Lobby";
import items from "../../../src/boardLogic/items";

interface GameEvent {
  type: string;
  data: any;
}

const Play: NextPage = () => {
  const router = useRouter();
  const { tableId: untypedTableId } = router.query;

  const [tableId, setTableId] = useState(untypedTableId as string | undefined);

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
        console.log("telling iframe table is ready")
        sendToIframe({type: "TABLE_CREATED"})
      }
    },
    [setTableId, sendToIframe]
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
    if (fullScreen) {
      if (typeof document.exitFullscreen !== 'undefined') {
        document.exitFullscreen();
      }
      setFullScreen(false)
      return
    }
    setFullScreen(true)
    if (typeof iframe.current?.requestFullscreen !== 'undefined') {
      iframe.current?.requestFullscreen();
    }
  }, [setFullScreen, fullScreen]);

  const handlePlayCardMessage = useCallback(
    async (evt: GameEvent) => {
      try {
        console.log("handle play card: ", evt);
        const name: "theieve" | "berserk" = evt.data.name;
        const item = items.find(
          (i) => i.name.toLowerCase() === name.toLowerCase()
        );
        if (!item) {
          throw new Error("item not found in the UI layer");
        }
        if (!gameRunner) {
          throw new Error('no game runner')
        }
        await gameRunner.playCard(item.address, item.id)
      } catch (err) {
        console.error('error playing card', err)
        sendToIframe({type: 'cardError', data: {}})
      }

    },
    [sendToIframe, gameRunner]
  );

  const handleMessage = useCallback(
    async (appEvent: GameEvent) => {
      if (!relayer?.ready()) {
        throw new Error("no relayer");
      }
      if (!tableId) {
        throw new Error("no tableId");
      }
      if (!gameRunner) {
        throw new Error("missing game runner")
      }

      console.log("params", tableId, appEvent.data);
      try {
        await gameRunner.setDestination(appEvent.data.destination[0], appEvent.data.destination[1])
      } catch (err) {
        console.error("error setting destination: ", err)
      }
    },
    [tableId, relayer, gameRunner]
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
                src={`https://playcanv.as/e/b/503db47c`}
                ref={iframe}
                top="0"
                left="0"
                w={fullScreen ? "100vw" : "100%"}
                minH={fullScreen ? "100vh" : "70vh"}
                position={fullScreen ? "fixed" : undefined}
                zIndex={4_000_000}
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
