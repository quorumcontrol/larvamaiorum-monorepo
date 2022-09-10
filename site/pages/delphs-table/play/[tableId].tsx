import {
  Text,
  Box,
  OrderedList,
  ListItem,
  HStack,
  Spacer,
  Flex,
  Heading,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import LoggedInLayout from "../../../src/components/LoggedInLayout";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import useMqttMessages from "../../../src/hooks/useMqttMessages";
import { useRelayer } from "../../../src/hooks/useUser";
import { NO_MORE_MOVES_CHANNEL } from "../../../src/utils/mqtt";
import promiseWaiter from "../../../src/utils/promiseWaiter";
import SingletonQueue from "../../../src/utils/singletonQueue";
import border from "../../../src/utils/dashedBorder";
import Video from "../../../src/components/Video";
import useGameRunner from "../../../src/hooks/gameRunner";
import GameOverScreen, {
  GameWarrior,
} from "../../../src/components/GameOverScreen";

const txQueue = new SingletonQueue();

interface AppEvent {
  type: string;
  data: any[];
}

const WarriorListItem: React.FC<{ warrior: GameWarrior }> = ({
  warrior: {
    name,
    wootgumpBalance,
    attack,
    defense,
    currentHealth,
    initialHealth,
  },
}) => {
  return (
    <ListItem pl="3">
      <HStack>
        <Text fontWeight="800">{name}</Text>
        <Spacer />
        <Text>{wootgumpBalance} $GUMP</Text>
      </HStack>
      <HStack spacing="4">
        <Text>ATK:{attack}</Text>
        <Text>
          HP:{Math.floor(currentHealth)}/{initialHealth}
        </Text>
        <Text>DEF:{defense}</Text>
      </HStack>
    </ListItem>
  );
};

const Play: NextPage = () => {
  const router = useRouter();
  const { tableId: untypedTableId } = router.query;
  const tableId = untypedTableId as string;
  const { address } = useAccount();
  const { data: relayer } = useRelayer();
  const isClient = useIsClientSide();
  const iframe = useRef<HTMLIFrameElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [warriors, setWarriors] = useState<GameWarrior[]>([]);
  const [ready, setReady] = useState(false);
  const { data: gameRunner, over } = useGameRunner(
    tableId,
    iframe.current || undefined,
    ready
  );

  // const mqttHandler = useCallback((topic: string, msg: Buffer) => {
  //   console.log('mqtt handler: ', topic, msg.toString())
  //   switch (topic) {
  //     case NO_MORE_MOVES_CHANNEL: {
  //       const { tick } = JSON.parse(msg.toString());
  //       return iframe.current?.contentWindow?.postMessage(
  //         JSON.stringify({
  //           type: "noMoreMoves",
  //           tick,
  //         }),
  //         "*"
  //       );
  //     }
  //     default:
  //       console.log("mqtt: ", topic);
  //   }
  // }, []);

  // useMqttMessages(mqttHandler);

  useEffect(() => {
    return () => {
      console.log("unmounted the play page");
      if (gameRunner) {
        gameRunner.stop();
      }
    };
  }, [gameRunner]);

  const handleGameTickMessage = useCallback(
    (evt: AppEvent) => {
      console.log("game tick: ", evt);
      setWarriors(evt.data);
    },
    [setWarriors]
  );

  const handleFullScreenMessage = useCallback(() => {
    setFullScreen((old) => !old);
  }, [setFullScreen]);

  const handleMessage = useCallback(
    async (appEvent: AppEvent) => {
      if (!relayer?.ready()) {
        throw new Error("no relayer");
      }

      console.log("params", tableId, appEvent.data[0], appEvent.data[1]);
      txQueue.push(async () => {
        await promiseWaiter(500); // try to fix a broken nonce issue
        const delphsTable = relayer.wrapped.delphsTable();

        iframe.current?.contentWindow?.postMessage(
          JSON.stringify({
            type: "destinationStarting",
            x: appEvent.data[0],
            y: appEvent.data[1],
          }),
          "*"
        );
        const tx = await delphsTable.setDestination(
          tableId,
          appEvent.data[0],
          appEvent.data[1],
          { gasLimit: 250000 }
        ); // normally around 80k
        console.log("--------------- destination tx: ", tx);
        return await tx
          .wait()
          .then((receipt) => {
            console.log("------------ destination receipt: ", receipt);
            iframe.current?.contentWindow?.postMessage(
              JSON.stringify({
                type: "destinationComplete",
                x: appEvent.data[0],
                y: appEvent.data[1],
                success: true,
              }),
              "*"
            );
          })
          .catch((err) => {
            console.error("----------- error with destinationSetter", err);
            iframe.current?.contentWindow?.postMessage(
              JSON.stringify({
                type: "destinationComplete",
                x: appEvent.data[0],
                y: appEvent.data[1],
                success: false,
              }),
              "*"
            );
          });
      });
    },
    [tableId, relayer]
  );

  useEffect(() => {
    const handler = async (evt: MessageEvent) => {
      if (evt.origin === "https://playcanv.as") {
        const appEvent: AppEvent = JSON.parse(evt.data);
        switch (appEvent.type) {
          case "destinationSetter":
            console.log("set destination received");
            await handleMessage(appEvent);
            break;
          case "fullScreenClick":
            return handleFullScreenMessage();
          case "gameTick":
            return handleGameTickMessage(appEvent);
          case "gm":
            return setReady(true);
          default:
            console.log("unhandled message type: ", appEvent);
        }
      }
    };
    console.log("add iframe msg listener");
    window.addEventListener("message", handler);
    return () => {
      console.log("removing iframe msg listener");
      window.removeEventListener("message", handler);
    };
  }, [handleMessage, handleFullScreenMessage, handleGameTickMessage]);

  return (
    <>
      <Video
        animationUrl="ipfs://bafybeiehqfim6ut4yzbf5d32up7fq42e3unxbspez7v7fidg4hacjge5u4"
        loop
        muted
        autoPlay
        id="jungle-video-background"
      />
      <LoggedInLayout>
        <Flex direction={["column", "column", "column", "row"]}>
          <Box minW="75%">
            {isClient && !over && (
              <Box
                id="game"
                as="iframe"
                src={`https://playcanv.as/e/p/wQEQB1Cp/?tableId=${tableId}&player=${address}`}
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
          <Spacer />

          {!over && (
            <Box
              p="6"
              maxW={["100%", "100%", "100%", "33%"]}
              backgroundImage={["none", "none", "none", border]}
            >
              <OrderedList fontSize="md" spacing={4}>
                {warriors.map((w) => {
                  return (
                    <WarriorListItem
                      warrior={w}
                      key={`warrior-stats-${w.id}`}
                    />
                  );
                })}
              </OrderedList>
            </Box>
          )}
        </Flex>
      </LoggedInLayout>
    </>
  );
};

export default Play;
