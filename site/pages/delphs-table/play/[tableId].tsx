import { VStack, Text, Heading, Box, Stack, OrderedList, ListItem, HStack, Spacer, Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import LoggedInLayout from "../../../src/components/LoggedInLayout";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import useMqttMessages from "../../../src/hooks/useMqttMessages";
import { useRelayer } from "../../../src/hooks/useUser";
import { NO_MORE_MOVES_CHANNEL, ROLLS_CHANNEL } from "../../../src/utils/mqtt";
import promiseWaiter from "../../../src/utils/promiseWaiter";
import SingletonQueue from "../../../src/utils/singletonQueue";
import border from "../../../src/utils/dashedBorder";

const txQueue = new SingletonQueue();

interface AppEvent {
  type: string;
  data: [number, number];
}

const Play: NextPage = () => {
  const router = useRouter();
  const { tableId: untypedTableId } = router.query;
  const tableId = untypedTableId as string;
  const { address } = useAccount();
  const { data: relayer } = useRelayer();
  const isClient = useIsClientSide();
  const iframe = useRef<HTMLIFrameElement>(null);
  const [fullScreen, setFullScreen] = useState(false);

  const mqttHandler = useCallback((topic: string, msg: Buffer) => {
    switch (topic) {
      case NO_MORE_MOVES_CHANNEL: {
        const { tick } = JSON.parse(msg.toString());
        return iframe.current?.contentWindow?.postMessage(
          JSON.stringify({
            type: "noMoreMoves",
            tick,
          }),
          "*"
        );
      }
      case ROLLS_CHANNEL: {
        const parsedMsg = JSON.parse(msg.toString());
        return iframe.current?.contentWindow?.postMessage(
          JSON.stringify({
            type: "orchestratorRoll",
            ...parsedMsg,
          }),
          "*"
        );
      }
      default:
        console.log("mqtt: ", topic);
    }
  }, []);

  useMqttMessages(mqttHandler);

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
          default:
            console.log("unhandled message type: ", appEvent);
        }
      }
    };
    console.log("add destination listener");
    window.addEventListener("message", handler);
    return () => {
      console.log("removing destination listener");
      window.removeEventListener("message", handler);
    };
  }, [handleMessage, handleFullScreenMessage]);

  return (
    <LoggedInLayout>
      <Flex direction={["column", "column", "column", "row"]} >
        <Box p={[0, 0, 0, 6]} backgroundImage={['none', 'none', 'none', border]} minW="75%">
          {isClient && (
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
        </Box>
        <Spacer />
        <Box p="6" maxW={["100%", "100%", "100%", "33%"]} backgroundImage={['none', 'none', 'none', border]}>
            <OrderedList  fontSize="md" stylePosition={"outside"}>
              <ListItem pl="3">
                <HStack>
                  <Text fontWeight="800">Fabulosity</Text>
                  <Spacer />
                  <Text>2 $GUMP</Text>
                </HStack>
                <HStack spacing="4">
                  <Text>ATK:300</Text>
                  <Text>HP:245/700</Text>
                  <Text>DEF:473</Text>
                </HStack>
              </ListItem>
            </OrderedList>
        </Box>
      </Flex>

    </LoggedInLayout>
  );
};

export default Play;
