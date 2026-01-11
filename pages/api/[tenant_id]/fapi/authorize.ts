import type { NextApiRequest, NextApiResponse } from 'next';



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const {
        tenant_id,
        _tk
    } = req.query;



}
























    // For FORM POST JWTs send the following back
    // regardless of whether it is an error or success. The value must always
    // be a signed JWT
    // 
    // <!DOCTYPE html>
    // <html>
    // <body onload="document.forms[0].submit()">
    //     <form method="post" action="https://client.example/callback">
    //     <input type="hidden" name="response"
    //             value="eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9..." />
    //     </form>
    // </body>
    // </html>