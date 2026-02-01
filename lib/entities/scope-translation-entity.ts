import { EntitySchema } from 'typeorm';

const ScopeTranslationEntity = new EntitySchema({

    columns: {
        scopeId: {
            type: String,
            primary: true,
            name: "scopeid"
        },
        languageCode: {
            type: String,
            primary: true,
            nullable: false,
            name: "languagecode"
        },
        translation: {
            type: String,
            primary: false,
            nullable: false,
            name: "translation"
        }
    },

    tableName: "scope_translation",
    name: "scopeTranslation",

});


export default ScopeTranslationEntity;