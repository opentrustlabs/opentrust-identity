import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "../dao/tenant-dao";
import ClientDao from "../dao/client-dao";
import ContactDao from "../dao/contact-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import { Client, Contact, SigningKey, Tenant } from "@/graphql/generated/graphql-types";
import { randomUUID } from "crypto";
import { CONTACT_TYPE_FOR_CLIENT, CONTACT_TYPE_FOR_SIGNING_KEY, CONTACT_TYPE_FOR_TENANT } from "@/utils/consts";
import { GraphQLError } from "graphql";
import { DaoFactory } from "../data-sources/dao-factory";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const keyDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const contactDao: ContactDao = DaoFactory.getInstance().getContactDao();


class ContactService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getContacts(objectId: string): Promise<Array<Contact>> {
        return contactDao.getContacts(objectId);
    }

    public async addContact(contact: Contact): Promise<Contact> {

        if(contact.objecttype === CONTACT_TYPE_FOR_TENANT){
            const tenant: Tenant | null = await tenantDao.getTenantById(contact.objectid);
            if(!tenant){
                throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
            }
        }
        else if(contact.objecttype === CONTACT_TYPE_FOR_CLIENT){
            const client: Client | null = await clientDao.getClientById(contact.objectid);
            if(!client){
                throw new GraphQLError("ERROR_CLIENT_DOES_NOT_EXIST");
            }
        }
        else if(contact.objecttype === CONTACT_TYPE_FOR_SIGNING_KEY){
            const key: SigningKey | null = await keyDao.getSigningKeyById(contact.objectid);
            if(!key){
                throw new GraphQLError("ERROR_KEY_DOES_NOT_EXIST");
            }
        }
        else {
            throw new GraphQLError("ERROR_INVALID_CONTACT_TYPE")
        }
        if(contact.email.length < 3 || contact.email.indexOf("@") < 0){
            throw new GraphQLError("ERROR_INVALID_EMAIL");
        }

        contact.contactid = randomUUID().toString();
        await contactDao.addContact(contact);
        return Promise.resolve(contact);        
    }

    public async removeContact(contactId: string): Promise<void> {
        await contactDao.removeContact(contactId);
    }
}

export default ContactService;