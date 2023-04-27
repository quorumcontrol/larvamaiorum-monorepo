import { QueryClient } from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import { createEmbedding } from "./embedding.ts";
import { Database } from "./database.types.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";

type Content = Database["public"]["Tables"]["content"]["Row"]
type ContentChunks = Database["public"]["Tables"]["content_chunks"]["Row"]

type Distance = { distance: number }
type WithFullContent = { content: string }

export interface Memory {
  content: (Content & Distance & WithFullContent)[]
  chunks: (ContentChunks & Distance & WithFullContent & {parent: Content})[]
}

interface SemanticQuery {
  connection: QueryClient,
  client: SupabaseClient<Database>,
  content: string,
  tagIds: string[],
  max?: number,
  limit?: number,
  userId?: string,
}

/**
 * 
 * @param connection database connection
 * @param userId 
 * @param content This content will get turned into an embedding and then compared to the embeddings of all the users memories in the database. The memories with the closest embeddings will be returned.
 * @param limit number of documents to return
 * @returns Memory[]
 */
export const querySemantically = async (query:SemanticQuery):Promise<Memory> => {
  const { connection, client, content, tagIds, max = 0.2, limit = 5, userId } = query
  const embedding = await createEmbedding(content, userId);
  
  const docs = {
    content: await queryContents(connection, client, tagIds, embedding, max, limit),
    chunks: await queryChunks(connection, client,  tagIds, embedding, max, limit),
  }

  console.log("semantically similar docs: ", docs)

  return docs
};

const queryContents = async (
  connection: QueryClient,
  client: SupabaseClient<Database>,
  tagIds: string[],
  embedding: number[],
  max: number,
  limit = 5,
):Promise<Memory["content"]> => {
  const result = await connection.queryObject<Content & Distance>({
    text:
      `SELECT content.*, content.embedding <=> $2 AS distance
        FROM content
        JOIN content_tags ON content.id = content_tags.content_id
        WHERE content_tags.tag_name = ANY($1)
        AND ABS(embedding <=> $2) <= $3
        ORDER BY distance
        LIMIT $4;`,
    args: [tagIds, JSON.stringify(embedding), max, limit],
  });


  return Promise.all(result.rows.map(async (row) => {
    const { data, error } = await client.storage.from("content").download(`${row.id}/all.txt`)
    if (error) {
      console.error("error fetching url: ", error)
      throw error
    }
    return {
      ...row,
      content: await data?.text()
    }
  }))
}

const queryChunks = async (
  connection: QueryClient,
  client: SupabaseClient<Database>,
  tagIds: string[],
  embedding: number[],
  max: number,
  limit: number,
):Promise<Memory["chunks"]> => {
  const result = await connection.queryObject<ContentChunks & Distance>({
    text:
      `SELECT content_chunks.*, content_chunks.embedding <=> $2 AS distance
        FROM content_chunks
        JOIN content ON content_chunks.content_id = content.id
        JOIN content_tags ON content.id = content_tags.content_id
        WHERE content_tags.tag_name = ANY($1)
        AND ABS(content_chunks.embedding <=> $2) <= $3
        ORDER BY distance
        LIMIT $4;`,
    args: [tagIds, JSON.stringify(embedding), max, limit],
  });
  return Promise.all(result.rows.map(async (row) => {
    const { data, error } = await client.storage.from("content").download(`${row.content_id}/${row.chunk_order}.txt`)
    if (error) {
      console.error("error fetching chunk: ", error)
      throw error
    }

    const { data:contentData, error: urlError } = await client.from("content").select("*").eq("id", row.content_id).single()

    if (urlError) {
      console.error("error fetching url: ", urlError)
      throw urlError
    }

    return {
      ...row,
      content: await data?.text(),
      parent: contentData
    }
  }));
}
