import { User } from '@/graphql/generated/graphql-types';
import IdentityDao from '@/lib/dao/identity-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import type { NextApiRequest, NextApiResponse } from 'next';



// Note that this IAM tool can be used as a legacy user provider for any other
// IAM tool which supports legacy user migration, even new versions of this
// tool.
//
// For now, for testing purposes, we will implement default of true. Un-comment
// code for actual implementation.
//
// Note also that these endpoints should NOT be on a server that is publicly available.
// Future enhancements will be a authorization header with a signed JWT from the
// relying service with a scope of "legacy.user.migration"

const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();


export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    const {
		email
     } = req.query;

     let username: string | null = email as string;
     console.log("user name is " + username);

     if(!username){
        res.status(404).end();
        return;
     }
     const user: User | null = await identityDao.getUserBy("email", username);
     // For actualy implementation, at the next line it should be
     // if(!user){
     if(user){
        res.status(404).end();
        return;
     }
     else{
        res.status(200).end();
        return;
     }

}