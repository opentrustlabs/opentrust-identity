import { logWithDetails } from '@/lib/logging/logger';
import { SmsCallbackRequest } from '@/lib/models/sms';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * A trivial implementation of the sms service wrapper functionality.
 * 
 * To enable security callbacks, you need to specify the following in the
 * application in the system settings configuration screen:
 * 
 * SMS Callbakc URI: http://localhost:3000/api/sms-service/handler
 * 
 * This implementation will just print out the security event to the console. 
 * 
 * @param req 
 * @param res 
 * @returns 
 */

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if(req.method === "POST"){
        const smsMessage: SmsCallbackRequest = req.body as SmsCallbackRequest;
        logWithDetails("info", "Debugging Implementation of the SMS service wrapper", {...smsMessage});
    }
    res.status(200).end();
}

export const config = {
    api: {
      bodyParser: true,
    },
  };