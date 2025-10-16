import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
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
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    },
    tableName: "refresh_data",
    name: "refreshData",

});

export default RefreshDataEntity;
