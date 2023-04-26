

export const createSha256Hash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataAsUint8Array = encoder.encode(data);
  const digestArrayBuffer = await crypto.subtle.digest('SHA-256', dataAsUint8Array);
  const hashArray = Array.from(new Uint8Array(digestArrayBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
