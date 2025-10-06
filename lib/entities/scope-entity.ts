import { EntitySchema } from 'typeorm';

const ScopeEntity = new EntitySchema({


    columns: {
        scopeId: {
            type: String,
            primary: true,
            name: "scopeid"
        },
        scopeName: {
            type: String,
            primary: false,
            nullable: false,
            name: "scopename"
        },
        scopeDescription: {
            type: String,
            primary: false,
            nullable: false,
            name: "scopedescription"
        },
        scopeUse: {
            type: String,
            primary: false,
            nullable: false,
            name: "scopeuse"
        },
        markForDelete: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        }
    },

    tableName: "scope",
    name: "scope",

});


export default ScopeEntity;

