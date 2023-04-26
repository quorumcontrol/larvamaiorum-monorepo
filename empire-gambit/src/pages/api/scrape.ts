// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { JSDOM, ResourceLoader, FetchOptions } from 'jsdom'

type Data = {
  text: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const { url } = JSON.parse(req.body)
  let dom:JSDOM | undefined = undefined

  try {
    dom = await JSDOM.fromURL(url, { runScripts: "dangerously", pretendToBeVisual: true, resources: "usable"})
  
    await new Promise<void>((resolve) => {
      dom!.window.document.addEventListener("load", () => {
        console.log("resolved")
        dom!.window.requestAnimationFrame(() => {
          setTimeout(resolve, 150)
        })
      });
    })
  
    dom.window.document.querySelectorAll("iframe,script,img").forEach((el) => {
      el.remove()
    })
      
    const text = (dom.window.document.querySelector('body')?.textContent?.replace(/<iframe([\s\S]*?)<\/iframe>/, "") || "").trim().replace(
      /\s{2,}/g,
      " ",
    ).replace(/<[\s\S]*?>/g, " ")
  
    res.status(200).json( { text })
  } catch (err) {
    console.error("error scraping", err)
    res.status(500).end()
  } finally {
    dom?.window.close()
  }

}
