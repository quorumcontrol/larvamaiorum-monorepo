import { useQuery } from "react-query"
import { DateTime } from "luxon"
import { timeRank } from "../utils/rankings"

const TIME_ZONE = "utc-12"
const TEN_MINUTES = 10 * 60 * 1000

export const useLeaderboard = (timeFrame:'day'|'month') => {
  const now = DateTime.now().setZone(TIME_ZONE)
  return useQuery(
    ["wootgump-daily-leaderboard", timeFrame, now.startOf('day').toSeconds()],
    async () => {
      return timeRank(now, timeFrame)
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: TEN_MINUTES,
    }
  )
}