import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';


export interface PushedAuthRequest {
    requestUri: string,
	clientId: string,
	tenantId: string,
	responseType: string,
	redirectUri: string,
	scope: string,
	nonce: string,
	codeChallenge: string,
	codeChallengeMethod: string,
	responseMode: string,
    certificateThumbprint: string,
	createdAtMs: number,
	expiresAtMs: number
}


const {
    RDB_DIALECT
} = process.env;

const PushedAuthRequestEntity = new EntitySchema({
    columns: {
        requestUri: {
            type: String,
            primary: true,
            name: "requesturi"
        },        
        clientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientid"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        responseType: {
            type: String,
            primary: false,
            nullable: false,
            name: "responsetype"
        },
        redirectUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "redirecturi"
        },
        scope: {
            type: String,
            primary: false,
            nullable: false,
            name: "scope"
        },
        nonce: {
            type: String,
            primary: false,
            nullable: false,
            name: "nonce"
        },
        codeChallenge: {
            type: String,
            primary: false,
            nullable: false,
            name: "codechallenge"
        },
        codeChallengeMethod: {
            type: String,
            primary: false,
            nullable: false,
            name: "codechallengemethod"
        },
        responseMode: {
            type: String,
            primary: false,
            nullable: false,
            name: "responsemode"
        },
        expiresAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        createdAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        certificateThumbprint: {
            type: String,
            primary: false,
            nullable: true,
            name: "certificatethumbprint"
        }
    },

    tableName: "pushed_auth_request",
    name: "pushedAuthRequest",

});
export default PushedAuthRequestEntity;
