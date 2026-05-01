import type { NextApiRequest, NextApiResponse } from 'next'

const { HEALTH_CHECK_ENABLED } = process.env;

interface LiveResponse {
    status: 'alive';
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<LiveResponse>
) {
    if (HEALTH_CHECK_ENABLED !== 'true') {
        return res.status(404).end();
    }
    return res.status(200).json({ status: 'alive' });
}
