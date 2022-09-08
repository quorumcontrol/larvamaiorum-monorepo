import {
  Table,
  TableContainer,
  Thead,
  Tr,
  Th,
  Td,
  Heading,
  Spinner,
  Tbody,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "../src/components/Layout";
import Leaderboard from "../src/components/Leaderboard";
import { useUsername } from "../src/hooks/Player";
import { useLeaderboard } from "../src/hooks/useLeaderboard";
import humanFormatted from "../src/utils/humanFormatted";

const LeaderboardPage: NextPage = () => {
  const router = useRouter()
  const { diff:untyped } = router.query
  const diff = untyped as string|undefined

  return (
    <Layout>
      <Heading>Leaderboard</Heading>
      <Tabs>
        <TabList>
          <Tab>Daily</Tab>
          <Tab>Weekly</Tab>
          <Tab>Team</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Leaderboard type="gump" timeframe="day" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="gump" timeframe="week" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="team" timeframe="week" diff={diff} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

export default LeaderboardPage;
