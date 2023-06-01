import CircularVideo from "@/components/CircularVideo";
import Layout from "@/components/Layout";
import NavigationProfile from "@/components/NavigationProfile";
import ReadyPlayerMeCreator from "@/components/ReadyPlayerMeCreator";
import MinervaText from "@/components/minerva/MinervaText";
import { useMintProfile, useUser } from "@/hooks/useUser";
import { Box, Button, FormControl, FormErrorMessage, HStack, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import Router from "next/router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useSigner } from "wagmi";

interface FormData {
  username?: string
  email?: string
  avatar?: string
}

const PageEffect: React.FC<{ src: string }> = ({ src }) => {
  return (
    <Box position="fixed" bottom="0" left="0" width="100vw" pointerEvents="none" zIndex="-1">
      <Box
        as="video"
        muted
        autoPlay
        loop
        preload="auto"
        w="100vw"
        h="100vh"
        objectFit="fill"
        opacity={0.1}
        filter="blur(3px)"
      >
        <source src={src} type="video/mp4" />
      </Box>
    </Box>
  )
}

const EditProfilePage: NextPage = () => {
  const { isConnected, isConnecting } = useAccount()
  const { data: signer } = useSigner()
  const { data: user, isLoading: _userDataLoading } = useUser()
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState<FormData>({})

  const { mutateAsync } = useMintProfile()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>();

  const onAvatarPicked = useCallback(async (avatar: string) => {
    try {
      setLoading(true)

      setFormState((s) => {
        return {
          ...s,
          avatar,
        }
      })
      if (!formState.username || !avatar) {
        console.error("missing username or avatar", formState, avatar)
        throw new Error("missing username or avatar")
      }

      if (formState.email) {
        // fire and forget the email subscription
        fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            email: formState.email,
          }),
        }).then((resp) => {
          console.log("email subscription response: ", resp)
        }).catch((err) => {
          console.error("error subscribing to email", err)
        })
      }

      const result = await mutateAsync({
        name: formState.username,
        animationUrl: avatar,
        image: avatar.replace(".glb", ".png"),
        description: "",
      })
      console.log("complete!", result)
      await Router.push("/game")
    } catch (err) {
      console.error("error saving the profile", err)
      throw err
    } finally {
      setLoading(false)
    }

  }, [formState, mutateAsync])

  const onSubmit = async (data: FormData) => {
    console.log("on submit email/name", data)
    setFormState((s) => {
      return {
        ...s,
        ...data,
      }
    })
    return true
  }

  if (loading) {
    return (
      <Layout showNavigation={false}>
        <HStack>
          <Text>Creating your profile...</Text>
          <Spinner />
        </HStack>
      </Layout>
    )
  }

  if (isConnecting || (isConnected && !signer)) {
    return (
      <Layout showNavigation={false}>
        <Spinner />
      </Layout>
    )
  }

  if (!isConnected) {
    return (
      <>
        <Layout showNavigation={false}>
          <VStack>
            <CircularVideo src="/videos/imustknowwhoyouare.mp4" w="358px" h="358px" autoPlay />
            <MinervaText>Visitor, in order to play I must know who you are </MinervaText>
            <NavigationProfile />
          </VStack>

        </Layout>
        <PageEffect src="/videos/network_inverted.mp4" />
      </>
    )
  }

  if (formState.username && !formState.avatar) {
    return (
      <>
        <Layout showNavigation={false}>
          <VStack h="100vh">
            <ReadyPlayerMeCreator onPicked={onAvatarPicked} width="100%" height="100%" visible={true}/>
          </VStack>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Layout showNavigation={false}>
        <VStack px="4">
          <CircularVideo src="/videos/esteemedfriend.mp4" w="358px" h="358px" autoPlay />
          <MinervaText>Esteemed friend, what can I call you?</MinervaText>
          <VStack as="form" onSubmit={handleSubmit(onSubmit)} maxW="lg">
            <FormControl
              isRequired
              isInvalid={!!errors.username}
              isDisabled={loading}
            >
              <Input
                id="username"
                type="text"
                {...register("username", { required: true })}
                defaultValue={user?.profile?.name}
              />
              <FormErrorMessage>Username is required.</FormErrorMessage>
            </FormControl>
            <Button variant="primary" type="submit">Next</Button>
          </VStack>
        </VStack>
      </Layout>
      <PageEffect src="/videos/network_inverted.mp4" />
    </>
  )
}

export default EditProfilePage
