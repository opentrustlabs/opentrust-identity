import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "../dao/tenant-dao";
import ClientDao from "../dao/client-dao";
import ContactDao from "../dao/contact-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import { Client, Contact, ErrorDetail, SigningKey, Tenant } from "@/graphql/generated/graphql-types";
import { randomUUID } from "crypto";
import { CHANGE_EVENT_CLASS_CONTACT, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_DELETE, CLIENT_READ_SCOPE, CLIENT_UPDATE_SCOPE, CONTACT_TYPE_FOR_CLIENT, CONTACT_TYPE_FOR_SIGNING_KEY, CONTACT_TYPE_FOR_TENANT, KEY_READ_SCOPE, KEY_UPDATE_SCOPE, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, TENANT_UPDATE_SCOPE } from "@/utils/consts";
import { GraphQLError } from "graphql";
import { DaoFactory } from "../data-sources/dao-factory";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const keyDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const contactDao: ContactDao = DaoFactory.getInstance().getContactDao();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

class ContactService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getContacts(objectId: string): Promise<Array<Contact>> {
        const getData = ServiceAuthorizationWrapper(
            {
                async performOperation() {
                    return contactDao.getContacts(objectId);
                },
                async additionalConstraintCheck(oidcContext: OIDCContext, result: Array<Contact> | null): Promise<{ isAuthorized: boolean, errorDetail: ErrorDetail, result: Array<Contact> | null }> {
                    if (result && result.length > 0) {
                        // just need the first contact in the list, since they will all by
                        // tied to the same type of object, based on the object id.
                        const contact: Contact = result[0];
                        let scopeRequired: string = "";
                        let tenantId: string = "";
                        if (contact.objecttype === CONTACT_TYPE_FOR_TENANT) {
                            const tenant: Tenant | null = await tenantDao.getTenantById(contact.objectid);
                            if (!tenant) {
                                throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
                            }
                            tenantId = tenant.tenantId;
                            scopeRequired = TENANT_READ_SCOPE;
                        }
                        else if (contact.objecttype === CONTACT_TYPE_FOR_CLIENT) {
                            const client: Client | null = await clientDao.getClientById(contact.objectid);
                            if (!client) {
                                throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011}});
                            }
                            tenantId = client.tenantId;
                            scopeRequired = CLIENT_READ_SCOPE;
                        }
                        else if (contact.objecttype === CONTACT_TYPE_FOR_SIGNING_KEY) {
                            const key: SigningKey | null = await keyDao.getSigningKeyById(contact.objectid);
                            if(!key) {
                                throw new GraphQLError(ERROR_CODES.EC00015.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00015}});
                            }
                            tenantId = key.tenantId;
                            scopeRequired = KEY_READ_SCOPE;
                        }
                        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(oidcContext, [TENANT_READ_ALL_SCOPE, scopeRequired], tenantId);
                        if(!isAuthorized){
                            return {isAuthorized, errorDetail, result: null};
                        }
                        return {isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR, result: result};
                    }
                    return {isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR, result: result};
                }
            }
        );
        const contacts = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, CLIENT_READ_SCOPE, TENANT_READ_SCOPE, KEY_READ_SCOPE]);
        return contacts || [];
    }

    public async addContact(contact: Contact): Promise<Contact> {
        let scopeRequired: string = "";
        let tenantId: string = "";
        if(contact.objecttype === CONTACT_TYPE_FOR_TENANT){
            const tenant: Tenant | null = await tenantDao.getTenantById(contact.objectid);
            if(!tenant){
                throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
            }
            tenantId = tenant.tenantId;
            scopeRequired = TENANT_UPDATE_SCOPE;
        }
        else if(contact.objecttype === CONTACT_TYPE_FOR_CLIENT){
            const client: Client | null = await clientDao.getClientById(contact.objectid);
            if(!client){
                throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011}});
            }
            tenantId = client.tenantId;
            scopeRequired = CLIENT_UPDATE_SCOPE;
        }
        else if(contact.objecttype === CONTACT_TYPE_FOR_SIGNING_KEY){
            const key: SigningKey | null = await keyDao.getSigningKeyById(contact.objectid);
            if(!key){
                throw new GraphQLError(ERROR_CODES.EC00015.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00015}});
            }
            tenantId = key.tenantId;
            scopeRequired = KEY_UPDATE_SCOPE;
        }
        else {
            throw new GraphQLError(ERROR_CODES.EC00016.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00016}});
        }
        if(contact.email.length < 3 || contact.email.indexOf("@") < 0){
            throw new GraphQLError(ERROR_CODES.EC00017.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00017}});
        }

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, scopeRequired, tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        contact.contactid = randomUUID().toString();
        await contactDao.addContact(contact);
        changeEventDao.addChangeEvent({
            objectId: contact.contactid,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CONTACT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...contact})
        });
        return Promise.resolve(contact);        
    }

    public async removeContact(contactId: string): Promise<void> {
        const contact: Contact | null = await contactDao.getContactById(contactId);
        if(contact){
            let scopeRequired: string = "";
            let tenantId: string = "";
            if(contact.objecttype === CONTACT_TYPE_FOR_TENANT){
                tenantId = contact.objectid;
                scopeRequired = TENANT_UPDATE_SCOPE;
            }
            else if(contact.objecttype === CONTACT_TYPE_FOR_CLIENT){
                const client: Client | null = await clientDao.getClientById(contact.objectid);
                if(!client){
                    throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011}});
                }
                tenantId = client.tenantId;
                scopeRequired = CLIENT_UPDATE_SCOPE;
            }
            else if(contact.objecttype === CONTACT_TYPE_FOR_SIGNING_KEY){
                const key: SigningKey | null = await keyDao.getSigningKeyById(contact.objectid);
                if(!key){
                    throw new GraphQLError(ERROR_CODES.EC00015.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00015}});
                }
                tenantId = key.tenantId;
                scopeRequired = KEY_UPDATE_SCOPE;
            }
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, scopeRequired, tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }
            await contactDao.removeContact(contactId);
            changeEventDao.addChangeEvent({
                objectId: contact.contactid,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_CONTACT,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_DELETE,
                changeTimestamp: Date.now(),
                data: JSON.stringify({...contact})
            });
        }
        return Promise.resolve();        
    }
}

export default ContactService;