import DistractionFreeLayout from "@/components/DistractionFreeLayout";
import { useUser } from "@/hooks/useUser";
import { Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { NextPage } from "next";
import Router from "next/router";
import { useEffect } from "react";
import { useAccount, useSigner } from "wagmi";


const EditProfilePage: NextPage = () => {
  const { isConnected, isConnecting } = useAccount()
  const { data:signer } = useSigner()
  // const { data:user, isLoading: userDataLoading } = useUser()

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      Router.push("/profile/edit/start")
    }
  }, [isConnected, isConnecting])

  if (!signer || !isConnected) {
    return (
      <DistractionFreeLayout>
        <Spinner />
      </DistractionFreeLayout>
    )
  }

  return (
    <DistractionFreeLayout>
      <Tabs>
        <TabList>
          <Tab>Name</Tab>
          <Tab>Avatar</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <p>Name!</p>
          </TabPanel>
          <TabPanel>
            <p>Avatar!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </DistractionFreeLayout>
  )
}

export default EditProfilePage
