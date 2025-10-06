import { EntitySchema } from 'typeorm';

const RefreshDataEntity = new EntitySchema({


    columns: {
        refreshToken: {
            type: String,
            primary: true,
            name: "refreshtoken"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        userId: {
            type: String,
            primary: false,
            nullable: false,
            name: "userid"
        },
        clientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientid"
        },
        redirecturi: {
            type: String,
            primary: false,
            nullable: false,
            name: "redirecturi"
        },
        refreshCount: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "refreshcount"
        },
        refreshTokenClientType: {
            type: String,
            primary: false,
            nullable: false,
            name: "refreshtokenclienttype"
        },
        scope: {
            type: String,
            primary: false,
            nullable: false,
            name: "scope"
        },
        codeChallenge: {
            type: String,
            primary: false,
            nullable: true,
            name: "codechallenge"
        },
        codeChallengeMethod: {
            type: String,
            primary: false,
            nullable: true,
            name: "codechallengemethod"
        },
        expiresAtMs: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    },
    tableName: "refresh_data",
    name: "refreshData",

});

export default RefreshDataEntity;
