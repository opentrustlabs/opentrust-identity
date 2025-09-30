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
        return mapper.get({contactId: types.Uuid.fromString(contactId)});
    }

    public async addContact(contact: Contact): Promise<Contact> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("contact");
        await mapper.insert(contact);
        return contact;
    }

    public async removeContact(contactId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("contact");
        await mapper.remove({
            contactId: types.Uuid.fromString(contactId)
        })
        return;
    }

}

export default CassandraContactDao;