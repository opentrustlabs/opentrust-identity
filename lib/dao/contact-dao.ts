import { Contact } from "@/graphql/generated/graphql-types";


abstract class ContactDao {

    abstract getContacts(objectId: string): Promise<Array<Contact>>;

    abstract getContactById(contactId: string): Promise<Contact | null>;

    abstract addContact(contact: Contact): Promise<Contact>;
    
    abstract removeContact(contactId: string): Promise<void>;

}

export default ContactDao;