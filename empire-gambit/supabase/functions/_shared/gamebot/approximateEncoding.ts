
export function tokenLength(str: string) {
  // return just a basic approximation of the token length of the string
  return Math.ceil(str.split(/\s+/).length / 0.75);
}

// Function to split text into chunks of a maximum token count
export function splitTextIntoChunks(text: string, maxTokens = 500): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    if (tokenLength(currentChunk + " " + word) > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk += " " + word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}