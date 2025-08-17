import { logWithDetails } from '@/lib/logging/logger';
import { SecurityEvent } from '@/lib/models/security-event';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * A trivial implementation of the security event handler callback functionality.
 * 
 * To enable security callbacks, you need to specify the following in your .env file:
 * 
 * SECURITY_EVENT_CALLBACK_URI=https://<domain>/path/to/security-events/handler
 * 
 * This will just print out the security event to the console. In real implementations
 * you would want to store these and look for anomalies, such as logging in from different
 * parts of the world. Or, in the case of a user logging in with a duress password, 
 * take some other type of action, including physical actions.
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
        const event: SecurityEvent = req.body as SecurityEvent;        
        logWithDetails("info", event.securityEventType, {...event});
    }
    res.status(200).end();
}

export const config = {
    api: {
      bodyParser: true,
    },
  };