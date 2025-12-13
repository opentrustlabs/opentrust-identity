
export interface RecaptchaResponse {
  success: boolean,
  score: number,
  challenge_ts: string,
  hostname: string,
  "error-codes": Array<string>
}