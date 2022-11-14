import { useQuery } from "react-query"

export const useMasksOfTheAncients = (address?:string) => {
  return useQuery(["/masks", address], () => {

  }, {
    enabled: !!address
  })
}
