import { useQuery } from "react-query"
import { client } from "../utils/colyseus"
import { LobbyState, ReservationRequest } from "../delphs-state/LobbyState"
import { useCallback, useState } from "react"
import { RoomAvailable } from 'colyseus.js'
import { useUsername } from "./Player"
import { useAccount } from "wagmi"
import { useLogin } from "./useUser"

export const useDelphsLobby = () => {
  const { address } = useAccount()
  const { data:username } = useUsername(address)
  const [rooms, setRooms] = useState<RoomAvailable[]>([])
  const [reservation, setReservation] = useState<any>(undefined)
  const { data:lobby } = useQuery(
    ['delphs-lobby'],
    async () => {
      try {
        const lobby = await client().joinOrCreate<LobbyState>('lobby')
        lobby.state.onChange = () => {
          console.log('room state: ', lobby.state.toJSON())
        }
        lobby.onMessage('reservation', (reservation:any) => {
          console.log("resrevation: ", reservation)
          setReservation(reservation)
        })
        return lobby
      } catch (err) {
        console.error("error with")
      }

    },
    {
      enabled: !!username,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )

  const requestTable = useCallback((reservation:ReservationRequest) => {
    if (!lobby) {
      console.error("no lobby")
      return
    }
    lobby.send("reserveRoom", reservation)
  }, [lobby])

  // useEffect(() => {
  //   if (!lobby) {
  //     return
  //   }
  //   // client().getAvailableRooms().then((rooms) => {
  //   //   console.log("rooms", rooms)
  //   //   setRooms(rooms)
  //   // })
   
  // }, [])

  return {
    lobby,
    rooms,
    requestTable,
    reservation
  }
}