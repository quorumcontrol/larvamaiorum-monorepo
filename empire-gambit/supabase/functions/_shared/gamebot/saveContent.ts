import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { Database } from "./database.types.ts";
import { ContentPipelineOutput } from "./contentPipeline.ts";

export const saveContent = async (
  supabase: SupabaseClient<Database>,
  parsed: ContentPipelineOutput,
) => {
  console.log("storing: ", parsed.userId, parsed.shortSummary, parsed.url);

  const [{ error: insertError }, { error: uploadError }] = await Promise.all([
    supabase.from("content").upsert({
      id: parsed.id,
      url: parsed.url,
      saver: parsed.userId,
      short_summary: parsed.shortSummary,
      summary: parsed.longSummary,
      embedding: JSON.stringify(parsed.embedding),
    }),
    supabase.storage.from("content").upload(
      `${parsed.id}/all.txt`,
      parsed.text,
    ),
    supabase.from("tags").upsert({
      name: parsed.tag,
    }),
  ]);

  if (uploadError) {
    if (uploadError.message !== "The resource already exists") {
      console.error("error uploading: ", uploadError);
      throw uploadError;
    }
  }

  if (insertError) {
    console.error("error inserting content: ", insertError);
    throw insertError;
  }

  await saveChunks(supabase, parsed.id, parsed.chunks),
    await supabase.from("content_tags").upsert({
      tag_name: parsed.tag,
      content_id: parsed.id,
    });

  return parsed.id;
};

const saveChunks = async (
  supabase: SupabaseClient<Database>,
  contentId: string,
  chunks: ContentPipelineOutput["chunks"],
) => {
  console.log("saving chunks", chunks.length, "chunks");
  const [{ error: chunkError }] = await Promise.all([
    supabase
      .from("content_chunks")
      .upsert(
        chunks.map((chunk, i) => ({
          content_id: contentId,
          chunk_order: i,
          short_summary: chunk.shortSummary,
          summary: chunk.longSummary,
          embedding: JSON.stringify(chunk.embedding),
        })),
      ),
    Promise.all(
      chunks.map(async (chunk, i) => {
        console.log("saving chunk: ", i, chunk.text.length);
        const { error } = await supabase.storage.from("content").upload(
          `${contentId}/${i}.txt`,
          chunk.text,
        );
        if (error) {
          if (error.message === "The resource already exists") {
            return;
          } else {
            throw error;
          }
        }
      }),
    ),
  ]);

  if (chunkError) {
    console.error("error saving chunks", chunkError);
    throw chunkError;
  }
};
