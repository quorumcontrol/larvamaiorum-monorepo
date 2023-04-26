export const getSingleJSONObject = (text?: string): string | null => {
  if (!text) {
    return null
  }
  const first = text.indexOf("{")
  const last = text.lastIndexOf("}")
  if (first === -1 || last === -1) {
    return null
  }
  return text.slice(first, last + 1)
}