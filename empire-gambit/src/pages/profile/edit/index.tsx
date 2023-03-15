import DistractionFreeLayout from "@/components/DistractionFreeLayout";
import ReadyPlayerMeCreator from "@/components/ReadyPlayerMeCreator";
import { useMintProfile, useUser } from "@/hooks/useUser";
import { Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import Router from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useSigner } from "wagmi";

interface FormData {
  username?: string
  email?: string
  avatar?: string
}

const EditProfilePage: NextPage = () => {
  const [tabIndex, setTabIndex] = useState(0)
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

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      Router.push("/profile/edit/start")
    }
  }, [isConnected, isConnecting])

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
      await Router.push("/")
    } catch (err) {
      console.error("error saving the profile", err)
      throw err
    } finally {
      setLoading(false)
    }

  }, [formState, mutateAsync])

  const onSubmit = async (data: FormData) => {
    setTabIndex(1)

    console.log("on submit email/name", data)
    setFormState((s) => {
      return {
        ...s,
        ...data,
      }
    })
    return true
  }

  if (!signer || !isConnected) {
    return (
      <DistractionFreeLayout>
        <Spinner />
      </DistractionFreeLayout>
    )
  }

  const handleTabsChange = (index: number) => {
    console.log('setting index: ', index)
    setTabIndex(index)
  }

  if (loading) {
    return (
      <DistractionFreeLayout>
        <Spinner />
      </DistractionFreeLayout>
    )
  }

  console.log("tab index: ", tabIndex)
  return (
    <DistractionFreeLayout>
      <Tabs index={tabIndex} onChange={handleTabsChange}>
        <TabList>
          <Tab>Name</Tab>
          <Tab>Avatar</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing="5" alignItems="left">

                <FormControl
                  isRequired
                  isInvalid={!!errors.username}
                  isDisabled={loading}
                >
                  <FormLabel htmlFor="username">
                    What do you want to be called?
                  </FormLabel>
                  <Input
                    id="username"
                    type="text"
                    {...register("username", { required: true })}
                    defaultValue={user?.profile?.name}
                  />
                  <FormHelperText>You can change this later.</FormHelperText>
                  <FormErrorMessage>Username is required.</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={!!errors.email}
                  isDisabled={loading}
                >
                  <FormLabel htmlFor="username">
                    Email addres
                  </FormLabel>
                  <Input
                    id="email"
                    type="text"
                    {...register("email", { required: false })}
                  />
                  <FormHelperText>We will use this only for updates on the game.</FormHelperText>
                  <FormErrorMessage>There was an error</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <Button variant="primary" disabled={loading} type="submit">
                    Next
                  </Button>
                  {loading && (
                    <FormHelperText>Confirm in your wallet.</FormHelperText>
                  )}
                </FormControl>
              </VStack>

            </form>


          </TabPanel>
          <TabPanel>
            <ReadyPlayerMeCreator onPicked={onAvatarPicked} width="100%" minH="500px" visible={tabIndex === 1} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </DistractionFreeLayout>
  )
}

export default EditProfilePage
