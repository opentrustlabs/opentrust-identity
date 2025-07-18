import { generateKeyPairSync, KeyObject, PrivateKeyInput, createPrivateKey } from "node:crypto";
import { pki } from "node-forge";
import { generateRandomToken } from "./dao-utils";

export function createJwtSigningKey(commonName: string, organizationName: string, expiresAt: Date): {passphrase: string, privateKey: string, certificate: string} {

    // **************************************************************************** //
    //     NOTES ON GENERATING A KEY PAIR, CSR, AND SIGNED CERTIFICATE              //
    // **************************************************************************** //

    // 1.   Use a passphrase if possible. This should be a random value
    //      which will eventually need to be encrypted and stored along
    //      with the key data
    const passphrase = generateRandomToken(20, "hex"); //"thisisthepassphraseforencryptingtheprivatekey";


    // 2.   Use the built-in functions in NodeJS to generate an RSA key pair.
    //      We may have to increase the modulus to 3072
    const { publicKey, privateKey } = generateKeyPairSync(
        "rsa",
        {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
                cipher: "aes-256-cbc",
                passphrase: passphrase
            }
        }
    );

    //console.log(privateKey);
    //console.log(publicKey);


    // 3.   We need to convert any encrypted private key (starting with 
    //      -----BEGIN ENCRYPTED PRIVATE KEY-----) to the basic private
    //      key that forge can work with. We can use the built-in NodeJS
    //      functions for this.
    const privateKeyInput: PrivateKeyInput = {
        key: privateKey,
        encoding: "utf-8",
        format: "pem",
        passphrase: passphrase
    };

    const privateKeyObject: KeyObject = createPrivateKey(privateKeyInput);
    const decryptedPrivateKey = privateKeyObject.export({ format: "pem", type: "pkcs8" }).toString();

    // console.log(decryptedPrivateKey);

    // 4.   Use the forge library to generate a csr for our self-signed certificate
    //      and then sign it.
    let csr: pki.CertificateSigningRequest = pki.createCertificationRequest();
    csr.publicKey = pki.publicKeyFromPem(publicKey);
    

    csr.setSubject([
        {
            shortName: "CN",
            value: commonName,
        },
        {
            shortName: "O",
            value: organizationName
        }
    ]);
    csr.sign(pki.privateKeyFromPem(decryptedPrivateKey));

    // console.log(pki.certificationRequestToPem(csr));

    // 5.   Use the forge library to create the certificate and sign it.
    const cert: pki.Certificate = pki.createCertificate();
    // Always prefix the random hex value with a 0 to make sure these are
    // never negative numbers when decoded
    cert.serialNumber = `0${generateRandomToken(17, "hex")}`;
    // Set the notBefore value to now. Can set it to some value in the future too.
    cert.validity.notBefore = new Date();

    cert.validity.notAfter = expiresAt;
    // Since this is a self signed cert, the subject and issuer are the same.
    cert.setSubject(csr.subject.attributes);
    cert.setIssuer(csr.subject.attributes);

    // Make sure that the certificate contains the public key, then
    // finally sign the certificate and convert it to its PEM format.
    cert.publicKey = pki.publicKeyFromPem(publicKey);
    cert.sign(pki.privateKeyFromPem(decryptedPrivateKey));
    const pemCert = pki.certificateToPem(cert);

    // console.log(pemCert);

    return {
        passphrase,
        privateKey,
        certificate: pemCert
    };
}