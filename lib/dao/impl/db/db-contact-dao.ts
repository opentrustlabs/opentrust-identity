import { Contact } from "@/graphql/generated/graphql-types";
import ContactDao from "../../contact-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Sequelize } from "sequelize";
import ContactEntity from "@/lib/entities/contact-entity";


class DBContactDao extends ContactDao {

    public async getContacts(objectId: string): Promise<Array<Contact>>{

        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<ContactEntity> = await sequelize.models.contact.findAll({
            where: {
                objectid: objectId
            }
        });
        return arr.map((e: ContactEntity) => e.dataValues);
    }

    public async getContactById(contactId: string): Promise<Contact | null>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: ContactEntity | null = await sequelize.models.contact.findOne({
            where: {
                contactid: contactId
            }
        });
        return entity ? entity.dataValues : null;
    }

    public async addContact(contact: Contact): Promise<Contact> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.contact.create(contact);
        return Promise.resolve(contact);
    }

    public async removeContact(contactId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.contact.destroy({
            where: {
                contactid: contactId
            }
        });
        
        return Promise.resolve();
    }

}

export default DBContactDao;