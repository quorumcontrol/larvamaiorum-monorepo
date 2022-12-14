import {
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  LinkBox,
  LinkOverlay,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useConnect } from "wagmi"
import NextLink from "next/link"
import { useUsername } from "../hooks/Player"
import useIsClientSide from "../hooks/useIsClientSide"
import { useDelphsGumpBalance, useWootgumpBalance } from "../hooks/useWootgump"
import humanFormatted from "../utils/humanFormatted"
import { useState } from "react"
import border from "../utils/dashedBorder"
import { SocialIcon } from "react-social-icons"
import { FcGoogle } from "react-icons/fc"
import { FaApple } from "react-icons/fa"
import { DiscordLoginButton } from "react-social-login-buttons"
import web3auth from "../utils/web3auth"

const NavigationProfile: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [errors, setErrors] = useState("")
  const { connect, connectors } = useConnect()
  const { address, isConnected } = useAccount()
  const { data: username } = useUsername(address)
  const isClient = useIsClientSide()
  const { data: balance } = useWootgumpBalance(address)
  const { data: dgumpBalance } = useDelphsGumpBalance(address)

  const onLoginClick = () => {
    setShowModal(true)
  }

  const onSocialLoginClick = async (loginType: string) => {
    try {
      setErrors("")
      console.log("connect")
      setConnecting(true)
      await web3auth.connectTo(loginType)
      console.log("connected")
      setShowModal(false)
      connect({
        connector: connectors.find((c) => c.id === "web3Auth"),
      })
    } catch (err) {
      console.error("error connecting: ", err)
      setErrors("Something went wrong")
    } finally {
      setConnecting(false)
    }

  }

  const LoginModalContent = () => {
    if (connecting) {
      return (
        <VStack alignItems="left" spacing="6">
          <Text>Complete sign in in the popup window.</Text>
          <Spinner />
        </VStack>
      )
    }
    return (
      <>
        {errors && (
          <Text color="red">{errors}</Text>
        )}
        <VStack alignItems="left" spacing="6">
          <DiscordLoginButton onClick={() => onSocialLoginClick("discord")} />
          <Text>Or use</Text>
          <HStack spacing="12">
            <LinkBox
              onClick={() => onSocialLoginClick("google")}
              cursor="pointer"
            >
              <VStack alignItems="center">
                <Icon as={FcGoogle} boxSize="12" />
                <Text>Google</Text>
              </VStack>
            </LinkBox>
            <LinkBox
              onClick={() => onSocialLoginClick("twitter")}
              cursor="pointer"
            >
              <VStack>
                <SocialIcon network="twitter" />
                <Text>Twitter</Text>
              </VStack>
            </LinkBox>
            <LinkBox
              onClick={() => onSocialLoginClick("apple")}
              cursor="pointer"
            >
              <VStack>
                <Icon as={FaApple} boxSize="12" color={"white"} />
                <Text>Apple</Text>
              </VStack>
            </LinkBox>
          </HStack>
        </VStack>
        <Heading size="lg" my="8" mt="12">
          Have a crypto wallet?
        </Heading>
        <Button as={"div"} variant="primary">
          <ConnectButton
            showBalance={false}
            chainStatus={"none"}
            accountStatus="avatar"
          />
        </Button>
      </>
    )
  }

  if (!isClient || !isConnected) {
    return (
      <>
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <ModalOverlay />
          <ModalContent p="6" bg="brand.background" maxW="600px">
            <ModalBody backgroundImage={border} p="6">
              <Heading size="lg">Sign up or Sign in</Heading>
              <LoginModalContent />
            </ModalBody>
          </ModalContent>
        </Modal>
        <Button variant="primary" onClick={onLoginClick}>
          Sign in
        </Button>
      </>
    )
  }

  return (
    <LinkBox>
      <HStack>
        <VStack alignItems="flex-end" spacing="0">
          <NextLink href={`/profile/${address}`} passHref>
            <LinkOverlay>
              <Heading size="md">{username}</Heading>
            </LinkOverlay>
          </NextLink>
          <HStack>
            <Text fontSize="md">{humanFormatted(balance)} $GUMP</Text>
            <Text fontSize="md">{humanFormatted(dgumpBalance)} $dGUMP</Text>
          </HStack>
        </VStack>
        <Box>
          <ConnectButton
            showBalance={false}
            chainStatus={"none"}
            accountStatus="avatar"
          />
        </Box>
      </HStack>
    </LinkBox>
  )
}

export default NavigationProfile
