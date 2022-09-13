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
import { useBadgeMetadata } from "../hooks/BadgeOfAssembly";
import { useUsername } from "../hooks/Player";
import { useLeaderboard } from "../hooks/useLeaderboard";
import humanFormatted from "../utils/humanFormatted";
import { LeaderBoardType, TimeFrames } from "../utils/rankings";

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

const TeamRow: React.FC<{
  team: number;
  balance: BigNumber;
  rank: number;
}> = ({ team, balance, rank }) => {
  const { data: meta } = useBadgeMetadata(team);
  return (
    <Tr>
      <Td>{rank + 1}</Td>
      <Td>{meta?.name || <Spinner />}</Td>
      <Td>{humanFormatted(balance)}</Td>
    </Tr>
  );
};

const Leaderboard: React.FC<{
  timeframe: TimeFrames;
  type: LeaderBoardType;
  diff?:string
}> = ({ timeframe, type, diff }) => {
  const { data: leaderboard, isLoading } = useLeaderboard(type, timeframe, diff as string|undefined);

  const label = timeframe === "day" ? "Day's" : "Week's";

  const entityLabel = type === "team" ? "Team" : "Player";

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
            <Th>{entityLabel}</Th>
            <Th>{label} Gump</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(leaderboard?.ranked || []).map((ranking, i) => {
            if (type === "team") {
              return (
                <TeamRow
                  team={ranking.team}
                  balance={ranking.balance}
                  rank={i}
                  key={`leaderboard-team-${timeframe}-${ranking.team}-${i}`}
                />
              );
            }
            return (
              <GumpRow
                address={ranking.address}
                balance={ranking.balance}
                rank={i}
                key={`leaderboard-${type}-${timeframe}-${ranking.address}-${i}`}
              />
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default Leaderboard;
