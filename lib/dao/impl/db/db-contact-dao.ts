import { Contact } from "@/graphql/generated/graphql-types";
import ContactDao from "../../contact-dao";
import RDBDriver from "@/lib/data-sources/rdb";

class DBContactDao extends ContactDao {

    public async getContacts(objectId: string): Promise<Array<Contact>>{
        const contactRepo = await RDBDriver.getInstance().getContactRepository();
        const arr = await contactRepo.find({
            where: {
                objectid: objectId
            }
        });
        return arr;
    }

    public async getContactById(contactId: string): Promise<Contact | null>{
        const contactRepo = await RDBDriver.getInstance().getContactRepository();
        const result = await contactRepo.findOne({
            where: {
                contactid: contactId
            }
        });
        return result;
    }

    public async addContact(contact: Contact): Promise<Contact> {
        const contactRepo = await RDBDriver.getInstance().getContactRepository();
        await contactRepo.insert(contact);
        return Promise.resolve(contact);
    }

    public async removeContact(contactId: string): Promise<void> {
        const contactRepo = await RDBDriver.getInstance().getContactRepository();
        await contactRepo.delete({
            contactid: contactId
        });
        return Promise.resolve();
    }

}

export default DBContactDao;