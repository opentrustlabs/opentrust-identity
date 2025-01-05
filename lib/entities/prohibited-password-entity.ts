import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "prohibited_passwords"
})
class ProhibitedPasswordEntity {

    @PrimaryKey({fieldName: "password"})
    password: string;
    
}

export default ProhibitedPasswordEntity;