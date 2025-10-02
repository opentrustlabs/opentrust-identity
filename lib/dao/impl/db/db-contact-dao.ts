import { Contact } from "@/graphql/generated/graphql-types";
import ContactDao from "../../contact-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import ContactEntity from "@/lib/entities/contact-entity";

class DBContactDao extends ContactDao {

    public async getContacts(objectId: string): Promise<Array<Contact>>{

        const arr: Array<ContactEntity> = await (await DBDriver.getInstance().getContactEntity()).findAll({
            where: {
                objectid: objectId
            }
        });
        return arr.map((e: ContactEntity) => e.dataValues);
    }

    public async getContactById(contactId: string): Promise<Contact | null>{

        const entity: ContactEntity | null = await (await DBDriver.getInstance().getContactEntity()).findOne({
            where: {
                contactid: contactId
            }
        });
        return entity ? entity.dataValues : null;
    }

    public async addContact(contact: Contact): Promise<Contact> {

        await (await DBDriver.getInstance().getContactEntity()).create(contact);
        return Promise.resolve(contact);
    }

    public async removeContact(contactId: string): Promise<void> {

        await (await DBDriver.getInstance().getContactEntity()).destroy({
            where: {
                contactid: contactId
            }
        });
        
        return Promise.resolve();
    }

}

export default DBContactDao;