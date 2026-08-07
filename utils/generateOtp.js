import crypto from "crypto";

export default function generateSecureOTP(length = 6) {
  // Generate cryptographically secure random bytes
  const buffer = crypto.randomBytes(length);
  let otp = "";

  for (let i = 0; i < length; i++) {
    // Restrict output to digits 0-9
    otp += buffer[i] % 10;
  }

  return otp;
}
