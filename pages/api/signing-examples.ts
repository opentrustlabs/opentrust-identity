import type { NextApiRequest, NextApiResponse } from 'next'
import { generateKeyPairSync, createPublicKey, KeyObject, PrivateKeyInput, createPrivateKey } from "node:crypto";
import { pem, sha256, hmac, pki } from "node-forge";
import { OIDCPrincipal } from '@/lib/models/principal';
import JwtService from '@/lib/service/jwt-service';
import { JWTPayload,  } from 'jose';
import { bcryptHashPassword, bcryptValidatePassword, generateRandomToken, pbkdf2HashPassword, sha256HashPassword } from '@/utils/dao-utils';
import FSBasedKms from '@/lib/kms/fs-based-kms';
import { CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS, TOKEN_TYPE_END_USER_TOKEN } from '@/utils/consts';

// const jwtService: JwtService = new JwtService();

// const oidcPrincipal: JWTPayload = {
//     sub: '1234567890',
//     iss: 'https://localhost:3000/api/oidc',
//     aud: '0987654321',
//     iat: 1734366485,
//     exp: 2004366485,
//     at_hash: '',
//     name: 'Firstname Lastname',
//     given_name: 'Firstname',
//     family_name: 'Lastnme',
//     middle_name: '',
//     nickname: '',
//     preferred_username: '',
//     profile: '',
//     phone_number: '',
//     address: '',
//     updated_at: '2025-01-01',
//     email: 'firstname.lastname@test.com',
//     country_code: 'US',
//     language_code: 'en',
//     jwt_id: '1234567890987654',
//     tenant_id: '1234567',
//     tenant_name: 'Test Tenant',
//     client_id: '7654321',
//     client_name: 'Test Client',
//     client_type: CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS,
//     token_type: TOKEN_TYPE_END_USER_TOKEN
// }

// **************************************************************************** //
//     NOTES ON GENERATING A KEY PAIR, CSR, AND SIGNED CERTIFICATE              //
// **************************************************************************** //

// 1.   Use a passphrase if possible. This should be a random value
//      which will eventually need to be encrypted and stored along
//      with the key data
const passphrase = "thisisthepassphraseforencryptingtheprivatekey";


// 2.   Use the built-in functions in NodeJS to generate an RSA key pair.
//      We may have to increase the modulus to 3072
// const {publicKey, privateKey} = generateKeyPairSync(
//     "rsa", 
//     {
//         modulusLength: 2048,
//         publicKeyEncoding : {
//             type: "spki",
//             format: "pem"
//         },
//         privateKeyEncoding: {
//             type: "pkcs8",
//             format: "pem",
//             cipher: "aes-256-cbc",
//             passphrase: passphrase
//         }
//     }
// );

// console.log(privateKey);
// console.log(publicKey);


// 3.   We need to convert any encrypted private key (starting with 
//      -----BEGIN ENCRYPTED PRIVATE KEY-----) to the basic private
//      key that forge can work with. We can use the built-in NodeJS
//      functions for this.
// const privateKeyInput: PrivateKeyInput = {
//     key: privateKey,
//     encoding: "utf-8",
//     format: "pem",
//     passphrase: passphrase
// }; 

// const privateKeyObject: KeyObject = createPrivateKey(privateKeyInput);
// const decryptedPrivateKey = privateKeyObject.export({format: "pem", type: "pkcs8"}).toString();

//console.log(decryptedPrivateKey);


// 4.   Use the forge library to generate a csr for our self-signed certificate
//      and then sign it.
// let csr: pki.CertificateSigningRequest = pki.createCertificationRequest();
// csr.publicKey = pki.publicKeyFromPem(publicKey);
// // We only need the CN for these CSRs
// csr.setSubject([
//     {
//         shortName: "CN",
//         value: "432123478930234"
//     },
//     {
//         shortName: "O",
//         value: "OpenCerts"
//     }
// ]);
// csr.sign(pki.privateKeyFromPem(decryptedPrivateKey));

//console.log(pki.certificationRequestToPem(csr));

// // 5.   Use the forge library to create the certificate and sign it.
// const cert: pki.Certificate = pki.createCertificate();
// // Always prefix the random hex value with a 0 to make sure these are
// // never negative numbers when decoded
// cert.serialNumber = `0${generateRandomToken(17, "hex")}`; 
// // Set the notBefore value to now. Can set it to some value in the future too.
// cert.validity.notBefore = new Date();

// // Set for expiration after 120 days
// const notAfterDate = new Date();
// // 1000 ms/second * 60 seconds/min * 60 min/hr * 24 hr/day * 120 days
// notAfterDate.setTime(notAfterDate.getTime() + 1000 * 60 * 60 * 24 * 120);
// cert.validity.notAfter = notAfterDate;
// // Since this is a self signed cert, the subject and issuer are the same.
// cert.setSubject(csr.subject.attributes);
// cert.setIssuer(csr.subject.attributes);

// Make sure that the certificate contains the public key, then
// finally sign the certificate and convert it to its PEM format.
// cert.publicKey = pki.publicKeyFromPem(publicKey);
// cert.sign(pki.privateKeyFromPem(decryptedPrivateKey));
// const pemCert = pki.certificateToPem(cert);

//console.log(pemCert);


const kms: FSBasedKms = new FSBasedKms();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    // const signedJwt: string = await jwtService.testJwtSign(oidcPrincipal, privateKey || "", passphrase);
    // const verifiedJwt: OIDCPrincipal | null = await jwtService.testJwtVerifySignatureWithPublicKey(signedJwt, publicKey || "");
    // const certVerifiedJwt: OIDCPrincipal | null = await jwtService.testJwtVerifySignatureWitCertificate(signedJwt, pemCert);

    // const obj = {        
    //     privateKey: privateKey,
    //     publicKey: publicKey,
    //     certificate: pemCert,
    //     signedJwt: signedJwt,
    //     verifiedJwt: verifiedJwt,
    //     certVerifiedJwt: certVerifiedJwt
    // }

    // const dataToEncrypt: string = "this is the data to encrypt";
    // const encryptedData: string | null = await kms.encryptWithKeyWrapping(dataToEncrypt, "additionalauthenticateddata");
    // const decryptedData = await kms.decryptWithKeyWrapping(encryptedData || "", "additionalauthenticateddata");
    
    // const encryptedData: string | null = await kms.encrypt(dataToEncrypt, "additionalauthenticateddata");
    // const decryptedData = await kms.decrypt(encryptedData || "", "additionalauthenticateddata");

    // const encryptedData: Buffer | null = await kms.encryptBufferWithKeyWrapping(Buffer.from(dataToEncrypt, "utf-8"), "additionalauthenticateddata");
    // const decryptedData: Buffer | null = encryptedData ? await kms.decryptBufferWithKeyWrapping(encryptedData, "additionalauthenticateddata") : null;

    // const encryptedData: Buffer | null = await kms.encryptBuffer(Buffer.from(dataToEncrypt, "utf-8"), "additionalauthenticateddata");
    // const decryptedData: Buffer | null = encryptedData ? await kms.decryptBuffer(encryptedData, "additionalauthenticateddata") : null;

    // const obj = {
    //     data: dataToEncrypt,
    //     encryptedData: encryptedData ? encryptedData.toString("base64") : null,
    //     decryptedData: decryptedData ? decryptedData.toString("utf-8") : null
    // }

    const timeStart = Date.now();
    const password = "DdvkUJYn9oQ2XL4";
    const salt = generateRandomToken(16, "base64");
    const hashedPassword = sha256HashPassword(password, salt, 64000);
    const timeEnd = Date.now();
    const hashTime = timeEnd - timeStart;

    const bcryptStart = Date.now();
    const bcryptHashedPassword = bcryptHashPassword(password, 11);
    const bcryptEnd = Date.now();
    const bcryptHashTime = bcryptEnd - bcryptStart;
    const bcryptValid = bcryptValidatePassword(password, bcryptHashedPassword);

    const pbkdf2Start = Date.now();
    const pbkdf2HashedPassword = pbkdf2HashPassword(passphrase, salt, 100000);
    const pbkdf2End = Date.now();
    const pbkdf2HashTime = pbkdf2End - pbkdf2Start;

    const obj = {
        password,
        salt,
        hashedPassword,
        timeStart,
        timeEnd,
        hashTime,
        bcryptHashedPassword,
        bcryptHashTime,
        bcryptValid,
        pbkdf2HashedPassword,
        pbkdf2HashTime
    };




    return res.status(200).json(obj);

}
