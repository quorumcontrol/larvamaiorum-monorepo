import { useQuery } from "react-query"
import { DateTime } from "luxon"
import { timeRank } from "../utils/rankings"

const TIME_ZONE = "utc-12"

export const useLeaderboard = () => {
  const now = DateTime.now().setZone(TIME_ZONE)
  return useQuery(
    ["wootgump-daily-leaderboard", now.startOf('day').toSeconds()],
    async () => {
      return timeRank(now, 'day')
    },
    {
      refetchOnMount: false,
    }
  )
}