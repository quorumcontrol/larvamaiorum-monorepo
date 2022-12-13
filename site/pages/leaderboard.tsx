import {
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Text,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "../src/components/Layout";
import Leaderboard from "../src/components/Leaderboard";

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
          {/* <Tab>Weekly</Tab>
          <Tab>Hourly</Tab>
          <Tab>Team</Tab>
          <Tab>First Gump</Tab>
          <Tab>First Blood</Tab>
          <Tab>Battles Won</Tab>
          <Tab>Gump Per Game</Tab>
          <Tab>Battles Won Per Game</Tab> */}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Text>Leaderboard is experiencing higher than normal load. Please try again tomorrow.</Text>
            {/* <Leaderboard type="gump" timeframe="day" diff={diff} /> */}
          </TabPanel>
          {/* <TabPanel>
            <Leaderboard type="gump" timeframe="week" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="dgump" timeframe="hour" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="team" timeframe="week" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="firstgump" timeframe="week" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="firstblood" timeframe="week" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="battleswon" timeframe="week" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="mostgump" timeframe="day" diff={diff} />
          </TabPanel>
          <TabPanel>
            <Leaderboard type="battlesPerGame" timeframe="day" diff={diff} />
          </TabPanel> */}
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

export default LeaderboardPage;
