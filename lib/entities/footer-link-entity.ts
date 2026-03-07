import { EntitySchema } from 'typeorm';


const FooterLinkEntity = new EntitySchema({

    columns: {
        footerlinkid: {
            type: String,
            primary: true,
            name: "footerlinkid"
        },
        tenantid: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        linktext: {
            type: String,
            primary: false,
            nullable: false,
            name: "linktext"
        },
        uri: {
            type: String,
            primary: false,
            nullable: false,
            name: "uri"
        }
    },
    tableName: "footer_link",
    name: "footerLink"
});


export default FooterLinkEntity;
