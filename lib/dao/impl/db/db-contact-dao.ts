import { Contact } from "@/graphql/generated/graphql-types";
import ContactDao from "../../contact-dao";
import { DBDriver, ContactEntity2 } from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";
// import connection  from "@/lib/data-sources/db";
// import ContactEntity from "@/lib/entities/contact-entity";

class DBContactDao extends ContactDao {

    public async getContacts(objectId: string): Promise<Array<Contact>>{

        /*
        const sequelize: Sequelize = await DBDriver.getConnection();
        const filter: any = {};
        if(tenantIds){
            filter.tenantId = { [Op.in]: tenantIds};
        }       
        
        const arr: Array<TenantEntity2> = await sequelize.models.tenant.findAll({
            where: filter,
            order: [
                ["tenantName", "ASC"]
            ],
            raw: true            
        });
        return Promise.resolve(arr as any as Array<Tenant>);
        */
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<ContactEntity2> = await sequelize.models.contact.findAll({
            where: {
                objectid: objectId
            }
        });
        // const em = connection.em.fork();
        // const r: Array<ContactEntity> = await em.find(
        //     ContactEntity, {
        //         objectid: objectId
        //     }
        // );
        return Promise.resolve(arr as any as Array<Contact>);
    }

    public async addContact(contact: Contact): Promise<Contact> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity = await sequelize.models.contact.create(contact);
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