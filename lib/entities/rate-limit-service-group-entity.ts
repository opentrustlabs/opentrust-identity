import { EntitySchema } from 'typeorm';

const RateLimitServiceGroupEntity = new EntitySchema({


    columns: {
        servicegroupid: {
            type: String,
            primary: true,
            name: "servicegroupid"
        },
        servicegroupname: {
            type: String,
            primary: false,
            nullable: false,
            name: "servicegroupname"
        },
        servicegroupdescription: {
            type: String,
            primary: false,
            nullable: true,
            name: "servicegroupdescription"
        },
        markForDelete: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        }
    },

    tableName: "rate_limit_service_group",
    name: "rateLimitServiceGroup",

});

export default RateLimitServiceGroupEntity;
