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
import Layout from "../src/components/Layout";
import Leaderboard from "../src/components/Leaderboard";
import { useUsername } from "../src/hooks/Player";
import { useLeaderboard } from "../src/hooks/useLeaderboard";
import humanFormatted from "../src/utils/humanFormatted";

const LeaderboardPage: NextPage = () => {

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
            <Leaderboard type="gump" timeframe="day" />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="gump" timeframe="week" />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="team" timeframe="week" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

export default LeaderboardPage;
