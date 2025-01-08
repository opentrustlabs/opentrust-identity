import { Entity, PrimaryKey, Property } from "@mikro-orm/core";


@Entity({
    tableName: "user_fido2_counter_rel"
})
class UserFido2CounterRelEntity {

    @PrimaryKey({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "fido2counter"})
    fido2Counter: number;

}

export default UserFido2CounterRelEntity;