import { Contact } from "@/graphql/generated/graphql-types";
import ContactDao from "../../contact-dao";
import connection  from "@/lib/data-sources/db";
import ContactEntity from "@/lib/entities/contact-entity";

class DBContactDao extends ContactDao {

    public async getContacts(objectId: string): Promise<Array<Contact>>{
        const em = connection.em.fork();
        const r: Array<ContactEntity> = await em.find(
            ContactEntity, {
                objectid: objectId
            }
        );
        return Promise.resolve(r);
    }

    public async addContact(contact: Contact): Promise<Contact> {
        const em = connection.em.fork();
        const entity: ContactEntity = new ContactEntity(contact);
        await em.persistAndFlush(entity);
        return Promise.resolve(contact);
    }

    public async removeContact(contactId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(
            ContactEntity,
            {
                contactid: contactId
            }
        )
        return Promise.resolve();
    }

}

export default DBContactDao;