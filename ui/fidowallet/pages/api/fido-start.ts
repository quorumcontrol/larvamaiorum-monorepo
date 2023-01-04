import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server'
import { NextApiRequest, NextApiResponse } from 'next'

// Human-readable title for your website
const rpName = 'SimpleWebAuthn Example'
// A unique identifier for your website
const rpID = 'localhost'
// The URL at which registrations and authentications should occur
const origin = `https://${rpID}`


export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ReturnType<typeof generateRegistrationOptions>>
) {
  const options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: "jan20231",
    userName: "jan2023-1",
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    // attestationType: 'any',
    authenticatorSelection: {
      requireResidentKey: true,
      residentKey: "required",
      userVerification: "discouraged",
      authenticatorAttachment: "cross-platform",
    },
    // supportedAlgorithmIDs: [-257,-7],
  })
  res.status(200).json(options)
}
