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
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { NextPage } from "next";
import Layout from "../src/components/Layout";
import { useUsername } from "../src/hooks/Player";
import { useLeaderboard } from "../src/hooks/useLeaderboard";
import humanFormatted from "../src/utils/humanFormatted";

const GumpRow: React.FC<{
  address: string;
  balance: BigNumber;
  rank: number;
}> = ({ address, balance, rank }) => {
  const { data: username } = useUsername(address);
  return (
    <Tr>
      <Td>{rank + 1}</Td>
      <Td>{username || address}</Td>
      <Td>{humanFormatted(balance)}</Td>
    </Tr>
  );
};

const Leaderboard: NextPage = () => {
  const { data: leaderboard, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <Layout>
        <Heading>Leaderboard</Heading>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>Leaderboard</Heading>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Player</Th>
              <Th>Days Gump</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(leaderboard?.ranked || []).map((ranking, i) => {
              return (
                <GumpRow
                  address={ranking.address}
                  balance={ranking.balance}
                  rank={i}
                  key={`leaderboard-${ranking.address}`}
                />
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default Leaderboard;
