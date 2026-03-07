import { EntitySchema } from 'typeorm';

const TenantLookAndFeelEntity = new EntitySchema({

    columns: {
        tenantid: {
            type: String,
            primary: true,
            name: "tenantid"
        },        
        headerbackgroundcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "headerbackgroundcolor"
        },
        headertext: {
            type: String,
            primary: false,
            nullable: true,
            name: "headertext"
        },
        headertextcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "headertextcolor"
        },
        logouri: {
            type: String,
            primary: false,
            nullable: true,
            name: "logouri"
        },        
        buttonbackgroundcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "buttonbackgroundcolor"
        },
        buttontextcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "buttontextcolor"
        },
        inputbordercolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "inputbordercolor"
        },
        pagebackgroundcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "pagebackgroundcolor"
        },
        footerbackgroundcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "footerbackgroundcolor"
        },
        footertextcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "footertextcolor"
        },
        linkcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "linkcolor"
        },
        layouttype: {
            type: String,
            primary: false,
            nullable: true,
            name: "layouttype"
        },    
        marketingimageuri: {
            type: String,
            primary: false,
            nullable: true,
            name: "marketingimageuri"
        },
        marketingtext: {
            type: String,
            primary: false,
            nullable: true,
            name: "marketingtext"
        },
        imagepanelposition: {
            type: String,
            primary: false,
            nullable: true,
            name: "imagepanelposition"
        },
        buttonborderradius: {
            type: String,
            primary: false,
            nullable: true,
            name: "buttonborderradius"
        },
        headerlogoposition: {
            type: String,
            primary: false,
            nullable: true,
            name: "headerlogoposition"
        }
    },
    tableName: "tenant_look_and_feel",
    name: "tenantLookAndFeel",

});


export default TenantLookAndFeelEntity;
