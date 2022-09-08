import { useQuery } from "react-query"
import { DateTime } from "luxon"
import { timeRank } from "../utils/rankings"

const TIME_ZONE = "utc-12"
const TEN_MINUTES = 10 * 60 * 1000

export const useLeaderboard = (type: "gump"|"team", timeFrame:'day'|'week'|'month', diff?:string) => {
  let startTime = DateTime.now().setZone(TIME_ZONE)
  if (diff) {
    console.log("diff: ", parseInt(diff, 10))
    startTime = startTime.plus({[timeFrame]: parseInt(diff, 10)})
  }
  console.log("start time: ", startTime.toLocaleString())
  return useQuery(
    ["wootgump-daily-leaderboard", type, timeFrame, startTime.startOf('day').toSeconds()],
    async () => {
      return timeRank(startTime, type, timeFrame)
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: TEN_MINUTES,
    }
  )
}