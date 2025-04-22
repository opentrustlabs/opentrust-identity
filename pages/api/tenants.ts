import { DBDriver, TenantEntity2 } from "@/lib/data-sources/sequelize-db";


import { NextApiRequest, NextApiResponse } from "next";
import { QueryTypes, Sequelize } from "sequelize";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const sequelize: Sequelize = await DBDriver.getConnection();

    

    const obj2 = await sequelize.models.tenant.findAll({
        raw: true
    });

    return res.status(200).json(
        obj2    
    );

}