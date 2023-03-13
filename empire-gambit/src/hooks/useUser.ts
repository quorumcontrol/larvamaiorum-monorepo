// import { useProvider, useSigner, useAccount } from "wagmi"
// import { PlayerProfile__factory } from "../contract-types"
// import { useQuery } from "react-query"
// import { useDeploys } from "@/contexts/deploys"
// import { useSafeFromUser } from "./useSafe"


// const usePlayerProfile = () => {
//     const provider = useProvider()
//     const { PlayerProfile: { address } } = useDeploys()

//     return PlayerProfile__factory.connect(address, provider)
// }

// export const useUser = () => {
//     const { data: safeAddr } = useSafeFromUser()
//     const playerProfile = usePlayerProfile()

//     return useQuery(
//         "profile",
//         async () => {
//             const tokens = await playerProfile.balanceOf(safeAddr!)
//             if (tokens.isZero()) {
//                 return null
//             }
//             const id = await playerProfile.tokenOfOwnerByIndex(safeAddr!, 0)
//             const profile = await playerProfile.metadata(id)
//             return profile
//         },
//         {
//             enabled: !!safeAddr,
//         }
//     )
// }   
