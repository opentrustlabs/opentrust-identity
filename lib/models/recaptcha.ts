
export interface RecaptchaV3Response {
  success: boolean,
  score: number,
  challenge_ts: string,
  hostname: string,
  "error-codes": Array<string>
}