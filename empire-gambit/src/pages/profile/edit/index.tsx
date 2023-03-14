import DistractionFreeLayout from "@/components/DistractionFreeLayout";
import ReadyPlayerMeCreator from "@/components/ReadyPlayerMeCreator";
import { useUser } from "@/hooks/useUser";
import { Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import Router from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useSigner } from "wagmi";

interface FormData {
  username: string
  email: string
  avatar?: string
}

const EditProfilePage: NextPage = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const { isConnected, isConnecting } = useAccount()
  const { data: signer } = useSigner()
  const { data: user, isLoading: _userDataLoading } = useUser()
  const [loading, _setLoading] = useState(false);

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

  const onAvatarPicked = useCallback((picked:string) => {
    console.log("avatar: ", picked)
  }, [])

  const onSubmit = handleSubmit((data) => {
    console.log("on submit", data)
  })

  if (!signer || !isConnected) {
    return (
      <DistractionFreeLayout>
        <Spinner />
      </DistractionFreeLayout>
    )
  }

  const handleTabsChange = (index:number) => {
    setTabIndex(index)
  }

  return (
    <DistractionFreeLayout>
      <Tabs tabIndex={tabIndex} onChange={handleTabsChange}>
        <TabList>
          <Tab>Name</Tab>
          <Tab>Avatar</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>

            <form onSubmit={onSubmit}>
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
                    {!loading && "Next"}
                    {loading && <Spinner />}
                  </Button>
                  {loading && (
                    <FormHelperText>Confirm in your wallet.</FormHelperText>
                  )}
                </FormControl>
              </VStack>

            </form>


          </TabPanel>
          <TabPanel>
            <ReadyPlayerMeCreator onPicked={onAvatarPicked} width="100%" minH="500px" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </DistractionFreeLayout>
  )
}

export default EditProfilePage
