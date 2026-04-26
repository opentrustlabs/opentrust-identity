
export interface RecaptchaResponse {
  success: boolean,
  score: number,
  challenge_ts: string,
  hostname: string,
  "error-codes": Array<string>
}

export interface RecaptchaEnterpriseResponse {
  name: string;
  event: {
    token: string;
    siteKey: string;
    expectedAction?: string;
  };
  riskAnalysis: {
    score: number;
    reasons: string[];
  };
  tokenProperties: {
    valid: boolean;
    hostname: string;
    action: string;
    createTime: string;
    invalidReason?: string;
  };
}