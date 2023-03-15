
// TODO: allow setting localhost via env variable
export const isLocalhost = () => {
  return !process.env.NEXT_PUBLIC_MAINNET
}
