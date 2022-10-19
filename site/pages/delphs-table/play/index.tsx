import {
  Text,
  Box,
  OrderedList,
  ListItem,
  HStack,
  Spacer,
  Flex,
  Button,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import LoggedInLayout from "../../../src/components/LoggedInLayout";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import { useRelayer } from "../../../src/hooks/useUser";
import promiseWaiter from "../../../src/utils/promiseWaiter";
import SingletonQueue from "../../../src/utils/singletonQueue";
import border from "../../../src/utils/dashedBorder";
import useGameRunner from "../../../src/hooks/gameRunner";
import GameOverScreen, {
  GameWarrior,
} from "../../../src/components/GameOverScreen";
import { useRegisterInterest, useWaitForTable } from "../../../src/hooks/Lobby";
import PickCardModal from "../../../src/components/PickCardModal";
import items, {
  getIdentifier,
  itemsByIdentifier,
} from "../../../src/boardLogic/items";
import { usePlayCardMutation } from "../../../src/hooks/useDelphsTable";

const txQueue = new SingletonQueue();

interface GameEvent {
  type: string;
  data: any
}

// const WarriorListItem: React.FC<{ warrior: GameWarrior }> = ({
//   warrior: {
//     name,
//     wootgumpBalance,
//     initialGump,
//     attack,
//     defense,
//     currentHealth,
//     initialHealth,
//     item,
//   },
// }) => {
//   const description = useMemo(() => {
//     if (!item) {
//       return undefined;
//     }
//     return itemsByIdentifier[getIdentifier(item)];
//   }, [item]);

//   const diff = wootgumpBalance - initialGump

//   return (
//     <ListItem
//       pl="3"
//       backgroundColor={description ? "rgba(254, 67, 67, 0.09)" : undefined}
//     >
//       <HStack>
//         <Text fontWeight="800">{name}</Text>
//         <Spacer />
//         <Text>{wootgumpBalance} $GUMP ({diff > 0 ? '+' : ''}{diff})</Text>
//       </HStack>
//       <HStack spacing="4">
//         <Text>ATK:{attack}</Text>
//         <Text>
//           HP:{Math.floor(currentHealth)}/{initialHealth}
//         </Text>
//         <Text>DEF:{defense}</Text>
//       </HStack>
//       {description && <Text>{description.name} card in play</Text>}
//     </ListItem>
//   );
// };

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
  // const [warriors, setWarriors] = useState<GameWarrior[]>([]);
  const [ready, setReady] = useState(false);
  const registerInterestMutation = useRegisterInterest();
  const { data: gameRunner, over } = useGameRunner(
    tableId,
    address,
    iframe.current || undefined,
    ready
  );

  // const [cardModalOpen, setCardModalOpen] = useState(false);

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

  // const handleGameTickMessage = useCallback(
  //   (evt: AppEvent) => {
  //     console.log("game tick: ", evt);
  //     setWarriors(evt.data);
  //   },
  //   [setWarriors]
  // );

  const handleFullScreenMessage = useCallback(() => {
    setFullScreen((old) => !old);
  }, [setFullScreen]);

  const handlePlayCardMessage = useCallback(async (evt:GameEvent) => {
    console.log('handle play card: ', evt)
    const name:'theieve'|'berserk' = evt.data.name
    const item = items.find((i) => i.name.toLowerCase() === name.toLowerCase())
    if (!item) {
      throw new Error('item not found in the UI layer')
    }
    mutation.mutateAsync({address: item.address, id: item.id})
  }, [mutation]);

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
        // sendToIframe({
        //   type: "destinationStarting",
        //   x: appEvent.data[0],
        //   y: appEvent.data[1],
        // });
        const tx = await delphsTable.setDestination(
          tableId,
          appEvent.data.destination[0],
          appEvent.data.destination[1],
          { gasLimit: 250000 }
        ); // normally around 80k
        console.log("--------------- destination tx: ", tx);
        return await tx
          .wait()
          // .then((receipt) => {
          //   console.log("------------ destination receipt: ", receipt);
          //   sendToIframe({
          //     type: "destinationComplete",
          //     x: appEvent.data[0],
          //     y: appEvent.data[1],
          //     success: true,
          //   });
          // })
          // .catch((err) => {
          //   console.error("----------- error with destinationSetter", err);
          //   sendToIframe({
          //     type: "destinationComplete",
          //     x: appEvent.data[0],
          //     y: appEvent.data[1],
          //     success: false,
          //   });
          // });
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
          // case "gameTick":
          //   return handleGameTickMessage(appEvent);
          case "loaded":
            console.log("we got a loaded!");
            if (!tableId) {
              registerInterestMutation.mutate({ addr: address! });
            }
            return setReady(true);
          // case "gm":
          //   return setReady(true);
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
      {/* <PickCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        runner={gameRunner}
        player={address}
      /> */}
      <LoggedInLayout>
        <Flex direction={["column", "column", "column", "row"]}>
          <Box minW="100%">
            {isClient && !over && (
              <Box
                id="game"
                as="iframe"
                // src={`https://playcanv.as/e/b/d5i364yY/?player=${address}`}
                src={`https://playcanv.as/e/b/21701962`}
                ref={iframe}
                top="0"
                left="0"
                w={fullScreen ? "100vw" : "100%"}
                minH={fullScreen ? "100vh" : "70vh"}
                position={fullScreen ? "fixed" : undefined}
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
