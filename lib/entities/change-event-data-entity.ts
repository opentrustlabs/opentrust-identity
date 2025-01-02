// import type { ChangeEventData } from "@/graphql/generated/graphql-types";
// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

// @Entity({
//     tableName: "change_event_data"
// })
class ChangeEventDataEntity {

    // constructor(m?: ChangeEventData){
    //     if(m){
    //         this.objectid = m.objectid;
    //         this.objecttype = m.objecttype;
    //         this.changeeventid = m.changeeventid;
    //         this.data = Buffer.from(m.data);
    //     }
    // }
    // __typename?: "ChangeEventData" | undefined;

    // @PrimaryKey({fieldName: "changeeventid"})
    // changeeventid: string;

    // @PrimaryKey({fieldName: "objectid"})
    // objectid: string;

    // @Property({fieldName: "objecttype"})
    // objecttype: string;

    // @Property({fieldName: "data", type: "blob"})
    // data: Buffer;

    // public toModel(): ChangeEventData{
    //     const m: ChangeEventData = {
    //         __typename: "ChangeEventData",
    //         changeeventid: this.changeeventid,
    //         data: this.data.toString("utf-8"),
    //         objectid: this.objectid,
    //         objecttype: this.objecttype
    //     };
    //     return m;
    // }
    
}

export default ChangeEventDataEntity