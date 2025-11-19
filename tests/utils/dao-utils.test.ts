import {
    base64Decode,
    base64Encode,
    generateRandomToken,
    generateCodeVerifierAndChallenge,
    generateHash,
    generateSalt,
    sha256HashPassword,
    bcryptHashPassword,
    bcryptValidatePassword,
    scryptHashPassword,
    pbkdf2HashPassword,
    getKeyByValue,
    getDomainFromEmail,
    hasValidLoopbackRedirectUri,
    generateUserCredential,
    getBlobTypeForDriver,
    stringToBlobTransformer,
    getBooleanTypeForDriver,
    BooleanTransformer,
    getBigIntTypeForDriver,
    getIntTypeForDriver
} from '@/utils/dao-utils';
import {
    PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS,
    PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS,
    PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS,
    PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS,
    PASSWORD_HASH_ITERATION_32K,
    PASSWORD_HASH_ITERATION_64K,
    PASSWORD_HASH_ITERATION_128K,
    PASSWORD_HASH_ITERATION_256K
} from '@/utils/consts';

describe('dao-utils', () => {
    describe('base64Encode and base64Decode', () => {
        it('should encode string to base64', () => {
            const input = 'Hello, World!';
            const encoded = base64Encode(input);
            expect(encoded).toBe('SGVsbG8sIFdvcmxkIQ==');
        });

        it('should decode base64 string', () => {
            const encoded = 'SGVsbG8sIFdvcmxkIQ==';
            const decoded = base64Decode(encoded);
            expect(decoded).toBe('Hello, World!');
        });

        it('should encode and decode round-trip successfully', () => {
            const original = 'Test string with special chars: !@#$%^&*()';
            const encoded = base64Encode(original);
            const decoded = base64Decode(encoded);
            expect(decoded).toBe(original);
        });

        it('should handle empty strings', () => {
            const encoded = base64Encode('');
            expect(encoded).toBe('');
            const decoded = base64Decode('');
            expect(decoded).toBe('');
        });

        it('should handle unicode characters', () => {
            const original = '你好世界 🌍';
            const encoded = base64Encode(original);
            const decoded = base64Decode(encoded);
            expect(decoded).toBe(original);
        });
    });

    describe('generateRandomToken', () => {
        it('should generate token with default base64url encoding', () => {
            const token = generateRandomToken(32);
            expect(token).toBeDefined();
            expect(token.length).toBeGreaterThan(0);
            // Base64url should not contain +, /, or =
            expect(token).not.toContain('+');
            expect(token).not.toContain('/');
            expect(token).not.toContain('=');
        });

        it('should generate token with hex encoding', () => {
            const token = generateRandomToken(16, 'hex');
            expect(token).toBeDefined();
            expect(token.length).toBe(32); // 16 bytes = 32 hex chars
            expect(/^[0-9a-f]+$/.test(token)).toBe(true);
        });

        it('should generate token with base64 encoding', () => {
            const token = generateRandomToken(24, 'base64');
            expect(token).toBeDefined();
            expect(token.length).toBeGreaterThan(0);
        });

        it('should generate different tokens on each call', () => {
            const token1 = generateRandomToken(32);
            const token2 = generateRandomToken(32);
            expect(token1).not.toBe(token2);
        });
    });

    describe('generateCodeVerifierAndChallenge', () => {
        it('should generate verifier and challenge', () => {
            const result = generateCodeVerifierAndChallenge();
            expect(result.verifier).toBeDefined();
            expect(result.challenge).toBeDefined();
            expect(result.verifier.length).toBeGreaterThan(0);
            expect(result.challenge.length).toBeGreaterThan(0);
        });

        it('should generate different values on each call', () => {
            const result1 = generateCodeVerifierAndChallenge();
            const result2 = generateCodeVerifierAndChallenge();
            expect(result1.verifier).not.toBe(result2.verifier);
            expect(result1.challenge).not.toBe(result2.challenge);
        });

        it('should generate challenge that is hash of verifier', () => {
            const result = generateCodeVerifierAndChallenge();
            const expectedChallenge = generateHash(result.verifier);
            expect(result.challenge).toBe(expectedChallenge);
        });
    });

    describe('generateHash', () => {
        it('should generate SHA256 hash with default parameters', () => {
            const data = 'test data';
            const hash = generateHash(data);
            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should generate consistent hash for same input', () => {
            const data = 'test data';
            const hash1 = generateHash(data);
            const hash2 = generateHash(data);
            expect(hash1).toBe(hash2);
        });

        it('should generate different hashes for different inputs', () => {
            const hash1 = generateHash('data1');
            const hash2 = generateHash('data2');
            expect(hash1).not.toBe(hash2);
        });

        it('should support SHA384 algorithm', () => {
            const data = 'test data';
            const hash = generateHash(data, 'sha384');
            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should support SHA512 algorithm', () => {
            const data = 'test data';
            const hash = generateHash(data, 'sha512');
            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should support different encodings', () => {
            const data = 'test data';
            const hashBase64url = generateHash(data, 'sha256', 'base64url');
            const hashHex = generateHash(data, 'sha256', 'hex');
            const hashBase64 = generateHash(data, 'sha256', 'base64');

            expect(hashBase64url).toBeDefined();
            expect(hashHex).toBeDefined();
            expect(hashBase64).toBeDefined();
            expect(hashBase64url).not.toBe(hashHex);
        });
    });

    describe('generateSalt', () => {
        it('should generate salt', () => {
            const salt = generateSalt();
            expect(salt).toBeDefined();
            expect(salt.length).toBeGreaterThan(0);
        });

        it('should generate different salts on each call', () => {
            const salt1 = generateSalt();
            const salt2 = generateSalt();
            expect(salt1).not.toBe(salt2);
        });
    });

    describe('sha256HashPassword', () => {
        it('should hash password with salt and iterations', () => {
            const password = 'myPassword123';
            const salt = 'someSalt';
            const iterations = 1000;
            const hash = sha256HashPassword(password, salt, iterations);

            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should generate consistent hash for same inputs', () => {
            const password = 'myPassword123';
            const salt = 'someSalt';
            const iterations = 1000;

            const hash1 = sha256HashPassword(password, salt, iterations);
            const hash2 = sha256HashPassword(password, salt, iterations);

            expect(hash1).toBe(hash2);
        });

        it('should generate different hashes for different passwords', () => {
            const salt = 'someSalt';
            const iterations = 1000;

            const hash1 = sha256HashPassword('password1', salt, iterations);
            const hash2 = sha256HashPassword('password2', salt, iterations);

            expect(hash1).not.toBe(hash2);
        });

        it('should generate different hashes for different salts', () => {
            const password = 'myPassword123';
            const iterations = 1000;

            const hash1 = sha256HashPassword(password, 'salt1', iterations);
            const hash2 = sha256HashPassword(password, 'salt2', iterations);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('bcryptHashPassword and bcryptValidatePassword', () => {
        it('should hash password with bcrypt', () => {
            const password = 'myPassword123';
            const hash = bcryptHashPassword(password, 10);

            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
            expect(hash).toContain('$2b$'); // Bcrypt hash format
        });

        it('should validate correct password', () => {
            const password = 'myPassword123';
            const hash = bcryptHashPassword(password, 10);
            const isValid = bcryptValidatePassword(password, hash);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', () => {
            const password = 'myPassword123';
            const hash = bcryptHashPassword(password, 10);
            const isValid = bcryptValidatePassword('wrongPassword', hash);

            expect(isValid).toBe(false);
        });

        it('should generate different hashes for same password with different rounds', () => {
            const password = 'myPassword123';
            const hash10 = bcryptHashPassword(password, 10);
            const hash11 = bcryptHashPassword(password, 11);

            expect(hash10).not.toBe(hash11);
        });
    });

    describe('scryptHashPassword', () => {
        it('should hash password with scrypt', () => {
            const password = 'myPassword123';
            const salt = generateSalt();
            const hash = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_32K);

            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should generate consistent hash for same inputs', () => {
            const password = 'myPassword123';
            const salt = 'fixedSalt';
            const cost = PASSWORD_HASH_ITERATION_32K;

            const hash1 = scryptHashPassword(password, salt, cost);
            const hash2 = scryptHashPassword(password, salt, cost);

            expect(hash1).toBe(hash2);
        });

        it('should generate different hashes for different salts', () => {
            const password = 'myPassword123';
            const cost = PASSWORD_HASH_ITERATION_32K;

            const hash1 = scryptHashPassword(password, 'salt1', cost);
            const hash2 = scryptHashPassword(password, 'salt2', cost);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('pbkdf2HashPassword', () => {
        it('should hash password with pbkdf2', () => {
            const password = 'myPassword123';
            const salt = generateSalt();
            const hash = pbkdf2HashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);

            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should generate consistent hash for same inputs', () => {
            const password = 'myPassword123';
            const salt = 'fixedSalt';
            const iterations = 10000;

            const hash1 = pbkdf2HashPassword(password, salt, iterations);
            const hash2 = pbkdf2HashPassword(password, salt, iterations);

            expect(hash1).toBe(hash2);
        });

        it('should generate different hashes for different iterations', () => {
            const password = 'myPassword123';
            const salt = 'fixedSalt';

            const hash1 = pbkdf2HashPassword(password, salt, 10000);
            const hash2 = pbkdf2HashPassword(password, salt, 20000);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('getKeyByValue', () => {
        enum TestEnum {
            FirstValue = 'FIRST',
            SecondValue = 'SECOND',
            ThirdValue = 'THIRD'
        }

        it('should return key for valid value', () => {
            const key = getKeyByValue(TestEnum, 'FIRST');
            expect(key).toBe('FirstValue');
        });

        it('should return key for another valid value', () => {
            const key = getKeyByValue(TestEnum, 'SECOND');
            expect(key).toBe('SecondValue');
        });

        it('should handle non-existent value', () => {
            const key = getKeyByValue(TestEnum, 'NONEXISTENT');
            expect(key).toBe(TestEnum[""]);
        });
    });

    describe('getDomainFromEmail', () => {
        it('should extract domain from email', () => {
            const domain = getDomainFromEmail('user@example.com');
            expect(domain).toBe('example.com');
        });

        it('should handle email with subdomain', () => {
            const domain = getDomainFromEmail('user@mail.example.com');
            expect(domain).toBe('mail.example.com');
        });

        it('should handle email with plus addressing', () => {
            const domain = getDomainFromEmail('user+tag@example.com');
            expect(domain).toBe('example.com');
        });

        it('should handle email with multiple @ signs', () => {
            const domain = getDomainFromEmail('user@name@example.com');
            expect(domain).toBe('name@example.com');
        });
    });

    describe('hasValidLoopbackRedirectUri', () => {
        it('should accept localhost redirect with different port', () => {
            const registeredUris = ['http://localhost:3000/callback'];
            const redirectUri = 'http://localhost:8080/callback';

            const result = hasValidLoopbackRedirectUri(registeredUris, redirectUri);
            expect(result).toBe(true);
        });

        it('should accept 127.0.0.1 redirect with different port', () => {
            const registeredUris = ['http://127.0.0.1:3000/callback'];
            const redirectUri = 'http://127.0.0.1:9000/callback';

            const result = hasValidLoopbackRedirectUri(registeredUris, redirectUri);
            expect(result).toBe(true);
        });

        it('should reject non-loopback address', () => {
            const registeredUris = ['http://localhost:3000/callback'];
            const redirectUri = 'http://example.com:3000/callback';

            const result = hasValidLoopbackRedirectUri(registeredUris, redirectUri);
            expect(result).toBe(false);
        });

        it('should reject different paths', () => {
            const registeredUris = ['http://localhost:3000/callback'];
            const redirectUri = 'http://localhost:8080/different';

            const result = hasValidLoopbackRedirectUri(registeredUris, redirectUri);
            expect(result).toBe(false);
        });

        it('should reject different hostnames', () => {
            const registeredUris = ['http://localhost:3000/callback'];
            const redirectUri = 'http://127.0.0.1:3000/callback';

            const result = hasValidLoopbackRedirectUri(registeredUris, redirectUri);
            expect(result).toBe(false);
        });

        it('should handle invalid redirect URI gracefully', () => {
            const registeredUris = ['http://localhost:3000/callback'];
            const redirectUri = 'not a valid uri';

            const result = hasValidLoopbackRedirectUri(registeredUris, redirectUri);
            expect(result).toBe(false);
        });

        it('should handle multiple registered URIs', () => {
            const registeredUris = [
                'http://localhost:3000/callback',
                'http://localhost:4000/auth',
                'http://127.0.0.1:5000/callback'
            ];
            const redirectUri = 'http://localhost:9999/auth';

            const result = hasValidLoopbackRedirectUri(registeredUris, redirectUri);
            expect(result).toBe(true);
        });
    });

    describe('generateUserCredential', () => {
        const userId = 'user-123';
        const password = 'TestPassword123!';

        it('should generate credential with bcrypt 10 rounds', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS);

            expect(credential.userId).toBe(userId);
            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS);
            expect(credential.hashedPassword).toBeDefined();
            expect(credential.hashedPassword).toContain('$2b$10$');
            expect(credential.salt).toBe('');
            expect(credential.dateCreatedMs).toBeDefined();
        });

        it('should generate credential with bcrypt 11 rounds', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS);
            expect(credential.hashedPassword).toContain('$2b$11$');
        });

        it('should generate credential with bcrypt 12 rounds', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS);
            expect(credential.hashedPassword).toContain('$2b$12$');
        });

        it('should generate credential with SHA256 64K iterations', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS);
            expect(credential.hashedPassword).toBeDefined();
            expect(credential.salt).toBeDefined();
            expect(credential.salt.length).toBeGreaterThan(0);
        });

        it('should generate credential with SHA256 128K iterations', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS);
            expect(credential.salt).toBeDefined();
        });

        it('should generate credential with PBKDF2 128K iterations', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS);
            expect(credential.salt).toBeDefined();
        });

        it('should generate credential with PBKDF2 256K iterations', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS);
            expect(credential.salt).toBeDefined();
        });

        it('should generate credential with Scrypt 32K iterations', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS);
            expect(credential.salt).toBeDefined();
        });

        it('should generate credential with Scrypt 64K iterations', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS);
            expect(credential.salt).toBeDefined();
        });

        it('should generate credential with Scrypt 128K iterations', () => {
            const credential = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS);

            expect(credential.hashingAlgorithm).toBe(PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS);
            expect(credential.salt).toBeDefined();
        });

        it('should generate different salts for non-bcrypt algorithms', () => {
            const credential1 = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS);
            const credential2 = generateUserCredential(userId, password, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS);

            expect(credential1.salt).not.toBe(credential2.salt);
        });
    });

    describe('getBlobTypeForDriver', () => {
        it('should return blob for mysql', () => {
            expect(getBlobTypeForDriver('mysql')).toBe('blob');
        });

        it('should return blob for mariadb', () => {
            expect(getBlobTypeForDriver('mariadb')).toBe('blob');
        });

        it('should return bytea for postgres', () => {
            expect(getBlobTypeForDriver('postgres')).toBe('bytea');
        });

        it('should return varbinary for mssql', () => {
            expect(getBlobTypeForDriver('mssql')).toBe('varbinary');
        });

        it('should return blob for oracle', () => {
            expect(getBlobTypeForDriver('oracle')).toBe('blob');
        });

        it('should return blob for sqlite', () => {
            expect(getBlobTypeForDriver('sqlite')).toBe('blob');
        });

        it('should return blob for better-sqlite3', () => {
            expect(getBlobTypeForDriver('better-sqlite3')).toBe('blob');
        });

        it('should throw error for unsupported database', () => {
            expect(() => getBlobTypeForDriver('unsupported')).toThrow('Unsupported database type for BLOB: unsupported');
        });
    });

    describe('stringToBlobTransformer', () => {
        it('should transform string to buffer and back with utf8', () => {
            const transformer = stringToBlobTransformer('utf8');
            const original = 'Hello, World!';

            const buffer = transformer.to(original);
            expect(Buffer.isBuffer(buffer)).toBe(true);

            const string = transformer.from(buffer);
            expect(string).toBe(original);
        });

        it('should handle null values in to transform', () => {
            const transformer = stringToBlobTransformer();
            const result = transformer.to(null);
            expect(result).toBeNull();
        });

        it('should handle null values in from transform', () => {
            const transformer = stringToBlobTransformer();
            const result = transformer.from(null);
            expect(result).toBeNull();
        });

        it('should use utf8 encoding by default', () => {
            const transformer = stringToBlobTransformer();
            const original = 'Test string';

            const buffer = transformer.to(original);
            const string = transformer.from(buffer);

            expect(string).toBe(original);
        });

        it('should support base64 encoding', () => {
            const transformer = stringToBlobTransformer('base64');
            const original = 'SGVsbG8sIFdvcmxkIQ==';

            const buffer = transformer.to(original);
            const string = transformer.from(buffer);

            expect(string).toBe(original);
        });
    });

    describe('getBooleanTypeForDriver', () => {
        it('should return boolean for mysql', () => {
            expect(getBooleanTypeForDriver('mysql')).toBe('boolean');
        });

        it('should return boolean for postgres', () => {
            expect(getBooleanTypeForDriver('postgres')).toBe('boolean');
        });

        it('should return boolean for sqlite', () => {
            expect(getBooleanTypeForDriver('sqlite')).toBe('boolean');
        });

        it('should return number for oracle', () => {
            expect(getBooleanTypeForDriver('oracle')).toBe('number');
        });

        it('should throw error for unsupported database', () => {
            expect(() => getBooleanTypeForDriver('unsupported')).toThrow('Unsupported database type for boolean: unsupported');
        });
    });

    describe('BooleanTransformer', () => {
        it('should transform true to 1', () => {
            const result = BooleanTransformer.to(true);
            expect(result).toBe(1);
        });

        it('should transform false to 0', () => {
            const result = BooleanTransformer.to(false);
            expect(result).toBe(0);
        });

        it('should transform null to null in to', () => {
            const result = BooleanTransformer.to(null);
            expect(result).toBeNull();
        });

        it('should transform undefined to null in to', () => {
            const result = BooleanTransformer.to(undefined as any);
            expect(result).toBeNull();
        });

        it('should transform true boolean from database', () => {
            const result = BooleanTransformer.from(true);
            expect(result).toBe(true);
        });

        it('should transform false boolean from database', () => {
            const result = BooleanTransformer.from(false);
            expect(result).toBe(false);
        });

        it('should transform 1 to true', () => {
            const result = BooleanTransformer.from(1);
            expect(result).toBe(true);
        });

        it('should transform 0 to false', () => {
            const result = BooleanTransformer.from(0);
            expect(result).toBe(false);
        });

        it('should transform string "1" to true', () => {
            const result = BooleanTransformer.from('1');
            expect(result).toBe(true);
        });

        it('should transform string "TRUE" to true', () => {
            const result = BooleanTransformer.from('TRUE');
            expect(result).toBe(true);
        });

        it('should transform string "true" to true', () => {
            const result = BooleanTransformer.from('true');
            expect(result).toBe(true);
        });

        it('should transform other strings to false', () => {
            const result = BooleanTransformer.from('0');
            expect(result).toBe(false);
        });

        it('should transform null to null in from', () => {
            const result = BooleanTransformer.from(null);
            expect(result).toBeNull();
        });

        it('should transform undefined to null in from', () => {
            const result = BooleanTransformer.from(undefined);
            expect(result).toBeNull();
        });
    });

    describe('getBigIntTypeForDriver', () => {
        it('should return bigint for mysql', () => {
            expect(getBigIntTypeForDriver('mysql')).toBe('bigint');
        });

        it('should return bigint for postgres', () => {
            expect(getBigIntTypeForDriver('postgres')).toBe('bigint');
        });

        it('should return bigint for sqlite', () => {
            expect(getBigIntTypeForDriver('sqlite')).toBe('bigint');
        });

        it('should return number for oracle', () => {
            expect(getBigIntTypeForDriver('oracle')).toBe('number');
        });

        it('should throw error for unsupported database', () => {
            expect(() => getBigIntTypeForDriver('unsupported')).toThrow('Unsupported database type for bigint: unsupported');
        });
    });

    describe('getIntTypeForDriver', () => {
        it('should return int for mysql', () => {
            expect(getIntTypeForDriver('mysql')).toBe('int');
        });

        it('should return int for postgres', () => {
            expect(getIntTypeForDriver('postgres')).toBe('int');
        });

        it('should return int for sqlite', () => {
            expect(getIntTypeForDriver('sqlite')).toBe('int');
        });

        it('should return number for oracle', () => {
            expect(getIntTypeForDriver('oracle')).toBe('number');
        });

        it('should throw error for unsupported database', () => {
            expect(() => getIntTypeForDriver('unsupported')).toThrow('Unsupported database type for int: unsupported');
        });
    });
});
