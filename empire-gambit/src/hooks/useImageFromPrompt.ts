import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useEffect } from "react"

export const useImageFromPrompt = () => {
  const client = useSupabaseClient()

  return {
    getImage: async (prompt:string) => {
      console.log("prompt with: ", prompt)
      const resp = await client.functions.invoke("images", {
        body: {
          prompt,
        }
      })

      console.log("image response: ", resp)

      if (!resp.data) {
        console.error("error getting images: ", resp.error)
        return
      }

      const { path } = resp.data

      const { data: { publicUrl } } = client.storage.from("images").getPublicUrl(path)

      return publicUrl
    }
  }

  // useEffect(() => {
  //   if (!prompt || !client.functions) {
  //     return
  //   }

  //   const doAsync = async () => {
  //     console.log("prompt with: ", prompt)
  //     const resp = await client.functions.invoke("images", {
  //       body: {
  //         prompt,
  //       }
  //     })

  //     console.log("image response: ", resp)

  //     if (!resp.data) {
  //       console.error("error getting images: ", resp.error)
  //       return
  //     }

  //     const { path } = resp.data

  //     const { data: { publicUrl } } = client.storage.from("images").getPublicUrl(path)

  //     setSrc(publicUrl)
  //   }
  //   doAsync()
  // }, [prompt, client])

  // return src
}