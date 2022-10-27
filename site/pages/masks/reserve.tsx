import {
  VStack,
  Text,
  Heading,
  Button,
  Box,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { utils } from "ethers";
import type { NextPage } from "next";
import Head from "next/head";
import { useAccount } from "wagmi";
import Layout from "../../src/components/Layout";
import Video from "../../src/components/Video";
import { useMaskAllowListBalance, usePresalePrice, usePresaleSpotsRemaining, usePurchaseMask } from "../../src/hooks/masks";
import { useLogin } from "../../src/hooks/useUser";
import { useWootgumpBalance } from "../../src/hooks/useWootgump";
import border from "../../src/utils/dashedBorder";
import humanFormatted from "../../src/utils/humanFormatted";

const COST_OF_SPOT = utils.parseEther('1000')

const ReserveMask: NextPage = () => {
  const { login, isLoggingIn, isLoggedIn } = useLogin()
  const { address } = useAccount()
  const { data: allowListBalance } = useMaskAllowListBalance(address)
  const { data: gumpBalance } = useWootgumpBalance(address)
  const { data: presalePrice } = usePresalePrice()
  const { data: spotsRemaining } = usePresaleSpotsRemaining()
  const { mutateAsync, isError: isBuyError, isSuccess: isBuySuccess, isLoading: isBuying, reset } = usePurchaseMask()

  const canAfford = gumpBalance && gumpBalance.gte(COST_OF_SPOT)

  const handleBuyClick = async () => {
    try {
      reset()
      await mutateAsync({addr: address!, cost: COST_OF_SPOT})
    } catch (err) {
      console.error("error buying: ", err)
    }
  }

  return (
    <>
      <Head>
        <title>Crypto Colosseum: Masks of the Ancients Reservation</title>
      </Head>
      <Layout>
        <Stack direction={["column", "row"]} justify="space-between">
          <Box p={["2", "10"]}>
            <Video
              animationUrl="/video/maskRapidFire.mp4"
              autoPlay
              playsInline
              muted
              loop
              maxH="600px"
              maxW="70vw"
              margin="auto"
            />
          </Box>
          <VStack
            p={["2", "10"]}
            borderColor="brand.orange"
            borderWidth={["0", "1px"]}
            alignItems="left"
            maxW={["full", "38%"]}
            spacing={5}
          >
            <Heading>Presale: Mask of the Ancients</Heading>
            <Text fontSize="md">
              Masks may be used in the summoning ritual to bring forth an artifact
              or recruit of the same rarity. Other benefits acrue to early mask
              holders. Masks of the Ancients come in 3 rarities:
              uncommon, rare, and ultra-rare.
            </Text>
            {spotsRemaining && (
              <Text fontSize="md">Only {spotsRemaining.toNumber()} pre-sale mask(s) remain.</Text>
            )}
            <Box p="5" backgroundImage={border}>
              <Text>One mask costs $GUMP {presalePrice ? humanFormatted(presalePrice) : '...'}</Text>
            </Box>
            <Box fontSize={"md"}>
              { allowListBalance && gumpBalance && (
                <>
                  <Text>Mask Balance: {allowListBalance.toString()}</Text>
                  <Text>$GUMP Balance: {humanFormatted(gumpBalance)}</Text>
                </>
              )}
              {!(allowListBalance && gumpBalance) && (
                <Spinner />
              )}
            </Box>
            { spotsRemaining?.eq(0) && <Text>Sold out.</Text>}
            { !isLoggingIn && !isLoggedIn && <Button variant="primary" onClick={() => login()}>Login </Button>}
            { isLoggedIn && canAfford && !isBuying && (spotsRemaining?.toNumber() || 0) > 0 && <Button variant="primary" onClick={handleBuyClick}>Buy (1) Presale Mask</Button> }
            { isBuyError && <Text>Something went wrong.</Text>}
            { isBuySuccess && <Text>Congratulations!</Text>} 
            { (isBuying || isLoggingIn ) && <Spinner />}
          </VStack>
        </Stack>
      </Layout>
    </>
  );
};

export default ReserveMask;
