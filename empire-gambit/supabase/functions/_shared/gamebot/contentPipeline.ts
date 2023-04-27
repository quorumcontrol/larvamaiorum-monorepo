import { Client } from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import { splitTextIntoChunks } from "./approximateEncoding.ts";
import { createEmbedding } from "./embedding.ts";
import { SummarizeResponse, recursivelySummarize } from "./summarize.ts";
import { createSha256Hash } from "./hash.ts";

interface ContentPipelineParams {
  userId:string;
  scrape: SiteScrape
  tag: string
  url?: string
  client?: Client
}

export interface SiteScrape {
  text: string;
  description?: string;
  title?: string;
  favicon?: string;
  image?: string;
}

interface ContentPipelineContentOutput {
  id: string
  userId: string
  url?: string
  tag: string
  embedding: number[]
  longSummary: string
  shortSummary: string
}

interface ContentPipelineChunkOutput {
  text: string
  embedding: number[]
}

export type ContentPipelineOutput = ContentPipelineContentOutput & SiteScrape & {
  chunks: (ContentPipelineChunkOutput & SummarizeResponse)[]
}

class ContentPipeline {
  userId: string
  url?: string;
  tag: string

  private scrape: SiteScrape
  
  constructor(props: ContentPipelineParams) {
    this.url = props.url
    this.userId = props.userId
    this.scrape = props.scrape
    this.tag = props.tag
  }
    
  async run():Promise<ContentPipelineOutput> {
    // scrape the site for metadata, etc
    const scrape = this.scrape
    // create chunks of 1500 tokens of the textual content
    const chunks = splitTextIntoChunks(scrape.text)
    console.log(this.url, "is ", chunks.length, "chunks")
    // create a summary of the chunks and the full text
    const summaries = await recursivelySummarize(this.userId, chunks)
    console.log("summaries: ", summaries)

    const relevantChunks = chunks.map((chunk, i) => {
      return {
        text: chunk,
        summary: summaries.chunks[i],
      }
    }).filter((chunk) => !chunk.summary.ignore)

    console.log("relevant chunks: ", relevantChunks)

    console.log("getting embeddings for: ", this.url)
    const embeddings = await Promise.all(relevantChunks.map((chunk) => createEmbedding(chunk.text, this.userId)))

    // create average the chunk embeddings for the full text
    const totalEmbedding = embeddings.reduce((acc, embedding) => {
      return acc.map((value, i) => value + embedding[i])
    })

    const averageEmbedding = totalEmbedding.map((value) => value / embeddings.length)

    console.log("parsed", this.url)
    return {
      id: await createSha256Hash(scrape.text),

      userId: this.userId,
      url: this.url,
      tag: this.tag,

      ...scrape,
      
      longSummary: summaries.longSummary,
      shortSummary: summaries.shortSummary,

      embedding: averageEmbedding,

      chunks: relevantChunks.map((chunk, i) => {
        return {
          text: chunk.text,
          ...chunk.summary,
          embedding: embeddings[i],
        }
      })
    }
  }
  

}

export default ContentPipeline;