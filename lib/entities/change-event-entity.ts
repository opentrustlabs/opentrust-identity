import type { ChangeEvent, Maybe } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "change_event"
})
class ChangeEventEntity {

    constructor(m?: ChangeEvent){
        if(m){
            this.changeEventId = m.changeEventId;
            this.changeEventClass = m.changeEventClass;
            this.changeEventClassId = m.changeEventClassId;
            this.changeEventType = m.changeEventType;
            this.changeEventTypeId = m.changeEventTypeId;
            this.changeTimestamp = m.changeTimestamp;
            this.changedById = m.changedById;
            this.keyId = m.keyId;
            this.signature = Buffer.from(m.signature);
        }
    }
    __typename?: "ChangeEvent" | undefined;
    
    @PrimaryKey({fieldName: "changeeventid"})
    changeEventId: string;

    @Property({fieldName: "changeeventclass"})
    changeEventClass: string;

    @Property({fieldName: "changeeventclassid"})
    changeEventClassId?: Maybe<string> | undefined;    

    @Property({fieldName: "changeeventtype"})
    changeEventType: string;

    @Property({fieldName: "changeeventtypeid"})
    changeEventTypeId?: Maybe<string> | undefined;

    @Property({fieldName: "changetimestamp"})
    changeTimestamp: number;

    @Property({fieldName: "changedbyid"})
    changedById: string;

    @Property({fieldName: "keyid"})
    keyId: string;

    @Property({fieldName: "signature"})
    signature: Buffer;

    public toModel(): ChangeEvent{
        const m: ChangeEvent = {
            __typename: "ChangeEvent",
            changeEventClass: this.changeEventClass,
            changeEventId: this.changeEventId,
            changeEventType: this.changeEventType,
            changeTimestamp: this.changeTimestamp,
            changedById: this.changedById,
            keyId: this.keyId,
            signature: this.signature.toString("utf-8"),
            changeEventClassId: this.changeEventClassId,
            changeEventTypeId: this.changeEventTypeId
        };
        return m;
    }
    
}

export default ChangeEventEntity;