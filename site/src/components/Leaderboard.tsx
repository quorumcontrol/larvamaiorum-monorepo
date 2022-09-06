import {
  Box,
  Table,
  TableContainer,
  Thead,
  Tr,
  Th,
  Td,
  Spinner,
  Tbody,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useUsername } from "../hooks/Player";
import { useLeaderboard } from "../hooks/useLeaderboard";
import humanFormatted from "../utils/humanFormatted";

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

const Leaderboard: React.FC<{ timeframe: "day" | "month" }> = ({
  timeframe,
}) => {
  const { data: leaderboard, isLoading } = useLeaderboard(timeframe);

  const label = timeframe === 'day' ? "Day's" : "Month's"

  if (isLoading) {
    return (
      <Box>
        <Spinner />
      </Box>
    );
  }

  return (
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Player</Th>
              <Th>{label} Gump</Th>
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
  );
};

export default Leaderboard;
