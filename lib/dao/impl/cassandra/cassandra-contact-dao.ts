import { Contact } from "@/graphql/generated/graphql-types";
import ContactDao from "../../contact-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import { types } from "cassandra-driver";

class CassandraContactDao extends ContactDao {

    public async getContacts(objectId: string): Promise<Array<Contact>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("contact");
        const results = await mapper.find({
            objectid: objectId
        });
        return results.toArray();
    }

    public async getContactById(contactId: string): Promise<Contact | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("contact");
        const result: Array<Contact> =  (await mapper.find({contactid: types.Uuid.fromString(contactId)}, {limit: 1})).toArray();
        if(result.length > 0){
            return result[0];
        }
        else{
            return null;
        }
    }

    public async addContact(contact: Contact): Promise<Contact> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("contact");
        await mapper.insert(contact);
        return contact;
    }

    public async removeContact(contactId: string): Promise<void> {
        const contact: Contact | null = await this.getContactById(contactId);
        if(contact){            
            const mapper = await CassandraDriver.getInstance().getModelMapper("contact");            
            await mapper.remove({
                contactid: types.Uuid.fromString(contactId),
                objectid: types.Uuid.fromString(contact.objectid)
            });
        }
        return;
    }

}

export default CassandraContactDao;