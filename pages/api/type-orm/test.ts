import { User } from '@/graphql/generated/graphql-types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { DataSource, EntitySchema, Repository } from 'typeorm';


const MyUserEntity = new EntitySchema({
    name: "users",
    tableName: "users",
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        address: {
            type: String,
            primary: false,
            nullable: true,
            name: "address"
        },
        addressLine1: {
            type: String,
            primary: false,
            nullable: true,
            name: "addressline1"
        },
        city: {
            type: String,
            primary: false,
            nullable: true,
            name: "city"
        },
        postalCode: {
            type: String,
            primary: false,
            nullable: true,
            name: "postalcode"
        },
        stateRegionProvince: {
            type: String,
            primary: false,
            nullable: true,
            name: "stateregionprovince"
        },
        countryCode: {
            type: String,
            primary: false,
            nullable: true,
            name: "countrycode"
        },
        domain: {
            type: String,
            primary: false,
            nullable: false,
            name: "domain"
        },
        email: {
            type: String,
            primary: false,
            nullable: false,
            name: "email"
        },
        emailVerified: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "emailverified"
        },
        enabled: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "enabled"
        },
        federatedOIDCProviderSubjectId: {
            type: String,
            primary: false,
            nullable: true,
            name: "federatedoidcprovidersubjectid"
        },
        firstName: {
            type: String,
            primary: false,
            nullable: false,
            name: "firstname"
        },
        lastName: {
            type: String,
            primary: false,
            nullable: false,
            name: "lastname"
        },
        locked: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "locked"
        },
        middleName: {
            type: String,
            primary: false,
            nullable: true,
            name: "middlename"
        },
        nameOrder: {
            type: String,
            primary: false,
            nullable: false,
            name: "nameorder"
        },
        phoneNumber: {
            type: String,
            primary: false,
            nullable: true,
            name: "phonenumber"
        },
        preferredLanguageCode: {
            type: String,
            primary: false,
            nullable: true,
            name: "preferredlanguagecode"
        },
        markForDelete: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        }
    }
});

let isInitialized: boolean = false;

const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "sagman",
    database: "OPEN_CERTS_OIDC_IAM",
    entities: [MyUserEntity],
    // ######## Standard mssql options for active directly authn
    // authentication: {
    //     type: "ntlm",
    //     options: {
    //         userName: "",
    //         password: "",
    //         domain: ""
    //     }
    // },
    extra: {
        // ######## MySQL pool options
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0 // Unlimited

        // ####### Postresql and MSSql pool options
        // max: 10,
        // min: 4

        // ######## Oracle pool options
        // poolMax: 10,
        // poolMin: 4
        //
        // ######### Standard tedious options
        // authentication: {
        //     type: "ntlm",
        //     options: {
        //     userName: "yourUsername",
        //     password: "yourPassword",
        //     domain: "YOURDOMAIN"
        //     }
        // }
    },
    // ######## Options for mssql connections
    // options: {
    //     encrypt: true,
    //     trustServerCertificate: true
    // }
});


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if(isInitialized === false){
        await dataSource.initialize();
        isInitialized = true;
    }

    const repo2= dataSource.getRepository(MyUserEntity);

    const u = await repo2.findOne({
        where: {
            userId: ""
        }
    });

    const repo: Repository<User> = dataSource.getRepository("users");
    const results: User | null = await repo.findOne({
        where: {
            userId: "17a5eaab-aeab-4774-be6e-b24ab2b98743"
        }
    });

    const results2 = await repo.find({
        skip: 10,
        take: 10,
        order: {
            lastName: "ASC"
        }
    });
    

    if(results){
        results.firstName = "Reginald2";
        results.lastName = "Perrywinkle2";
        await repo.save(results);
   }

    res.json({results, results2});

    
}

export const config = {
    api: {
      bodyParser: true,
    }
};





