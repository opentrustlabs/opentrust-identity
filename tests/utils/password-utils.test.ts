import {
    validatePasswordFormat,
    getUnicodeCategory,
    containsSpecialCharacterInAllowedList,
    containsAcceptableCodePoints,
    satisfiesMaxRepeatingCharLength,
    containsNumericCharacters,
    containsAsciiLowerCase,
    containsAsciiUpperCase,
    containsAsciiLetterCharacters
} from '@/utils/password-utils';
import { TenantPasswordConfig } from '@/graphql/generated/graphql-types';
import { DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED } from '@/utils/consts';

describe('password-utils', () => {
    describe('getUnicodeCategory', () => {
        it('should return "Letter" for letter characters', () => {
            expect(getUnicodeCategory('a')).toBe('Letter');
            expect(getUnicodeCategory('Z')).toBe('Letter');
            expect(getUnicodeCategory('é')).toBe('Letter');
            expect(getUnicodeCategory('中')).toBe('Letter');
        });

        it('should return "Number" for numeric characters', () => {
            expect(getUnicodeCategory('0')).toBe('Number');
            expect(getUnicodeCategory('9')).toBe('Number');
            expect(getUnicodeCategory('5')).toBe('Number');
        });

        it('should return "Symbol" for symbol characters', () => {
            expect(getUnicodeCategory('$')).toBe('Symbol');
            expect(getUnicodeCategory('+')).toBe('Symbol');
            expect(getUnicodeCategory('=')).toBe('Symbol');
        });

        it('should return "Punctuation" for punctuation characters', () => {
            expect(getUnicodeCategory('!')).toBe('Punctuation');
            expect(getUnicodeCategory('.')).toBe('Punctuation');
            expect(getUnicodeCategory(',')).toBe('Punctuation');
            expect(getUnicodeCategory('?')).toBe('Punctuation');
        });

        it('should return "Separator" for separator characters', () => {
            expect(getUnicodeCategory(' ')).toBe('Separator');
        });

        it('should return "Other" for control characters', () => {
            expect(getUnicodeCategory('\n')).toBe('Other');
            expect(getUnicodeCategory('\t')).toBe('Other');
        });
    });

    describe('containsSpecialCharacterInAllowedList', () => {
        it('should return true when password contains allowed special character', () => {
            expect(containsSpecialCharacterInAllowedList('password!', '!@#$')).toBe(true);
            expect(containsSpecialCharacterInAllowedList('pass@word', '!@#$')).toBe(true);
            expect(containsSpecialCharacterInAllowedList('p#ssword', '!@#$')).toBe(true);
        });

        it('should return false when password contains no special characters', () => {
            expect(containsSpecialCharacterInAllowedList('password', '!@#$')).toBe(false);
            expect(containsSpecialCharacterInAllowedList('Password123', '!@#$')).toBe(false);
        });

        it('should return false when password contains only non-allowed special characters', () => {
            expect(containsSpecialCharacterInAllowedList('pass^word', '!@#$')).toBe(false);
            expect(containsSpecialCharacterInAllowedList('pass&word', '!@#$')).toBe(false);
        });

        it('should work with default allowed characters', () => {
            expect(containsSpecialCharacterInAllowedList('pass_word', DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED)).toBe(true);
            expect(containsSpecialCharacterInAllowedList('pass-word', DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED)).toBe(true);
            expect(containsSpecialCharacterInAllowedList('pass!word', DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED)).toBe(true);
            expect(containsSpecialCharacterInAllowedList('pass@word', DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED)).toBe(true);
        });

        it('should return true if special character is at the beginning', () => {
            expect(containsSpecialCharacterInAllowedList('!password', '!@#$')).toBe(true);
        });

        it('should return true if special character is at the end', () => {
            expect(containsSpecialCharacterInAllowedList('password!', '!@#$')).toBe(true);
        });
    });

    describe('containsAcceptableCodePoints', () => {
        it('should return true for standard ASCII passwords', () => {
            expect(containsAcceptableCodePoints('Password123')).toBe(true);
            expect(containsAcceptableCodePoints('P@ssw0rd!')).toBe(true);
            expect(containsAcceptableCodePoints('abc_123-XYZ')).toBe(true);
        });

        it('should return false for passwords with control characters', () => {
            expect(containsAcceptableCodePoints('pass\nword')).toBe(false);
            expect(containsAcceptableCodePoints('pass\tword')).toBe(false);
            expect(containsAcceptableCodePoints('pass\rword')).toBe(false);
        });

        it('should return false for passwords with characters below code point 32', () => {
            expect(containsAcceptableCodePoints('pass\x00word')).toBe(false);
            expect(containsAcceptableCodePoints('pass\x01word')).toBe(false);
        });

        it('should return true for passwords with Unicode letter characters above 126', () => {
            expect(containsAcceptableCodePoints('Pàsswörd')).toBe(true);
            expect(containsAcceptableCodePoints('Pâssword')).toBe(true);
            expect(containsAcceptableCodePoints('Passñord')).toBe(true);
        });

        it('should return false for passwords with non-letter Unicode characters above 126', () => {
            expect(containsAcceptableCodePoints('Pass™word')).toBe(false);
            expect(containsAcceptableCodePoints('Pass©word')).toBe(false);
            expect(containsAcceptableCodePoints('Pass®word')).toBe(false);
        });

        it('should return true for empty string', () => {
            expect(containsAcceptableCodePoints('')).toBe(true);
        });
    });

    describe('satisfiesMaxRepeatingCharLength', () => {
        it('should return true when no repeating characters exceed limit', () => {
            expect(satisfiesMaxRepeatingCharLength('Password123', 3)).toBe(true);
            expect(satisfiesMaxRepeatingCharLength('Pass11word', 2)).toBe(true);
            expect(satisfiesMaxRepeatingCharLength('Passsword', 3)).toBe(true);
        });

        it('should return false when repeating characters exceed limit', () => {
            expect(satisfiesMaxRepeatingCharLength('Passssword', 3)).toBe(false);
            expect(satisfiesMaxRepeatingCharLength('Pass1111word', 3)).toBe(false);
            expect(satisfiesMaxRepeatingCharLength('Paaaassword', 3)).toBe(false);
        });

        it('should handle maxRepeatingCharLength of 1', () => {
            // maxRepeatingCharLength of 1 means we check if current char equals next 1 char
            // So 'aa' would fail (2 repeating), but 'ab' would pass
            expect(satisfiesMaxRepeatingCharLength('Password', 1)).toBe(false); // has 'ss'
            expect(satisfiesMaxRepeatingCharLength('Pasword', 1)).toBe(true); // no repeating chars
            expect(satisfiesMaxRepeatingCharLength('Passsword', 1)).toBe(false);
        });

        it('should handle maxRepeatingCharLength of 2', () => {
            expect(satisfiesMaxRepeatingCharLength('Pass11word', 2)).toBe(true);
            expect(satisfiesMaxRepeatingCharLength('Pass111word', 2)).toBe(false);
        });

        it('should return true for password shorter than maxRepeatingCharLength', () => {
            expect(satisfiesMaxRepeatingCharLength('Pw1', 5)).toBe(true);
            expect(satisfiesMaxRepeatingCharLength('P', 3)).toBe(true);
        });

        it('should handle repeating characters at the beginning', () => {
            expect(satisfiesMaxRepeatingCharLength('aaaaPassword', 3)).toBe(false);
        });

        it('should handle repeating characters at the end', () => {
            expect(satisfiesMaxRepeatingCharLength('Password1111', 3)).toBe(false);
        });

        it('should handle empty string', () => {
            expect(satisfiesMaxRepeatingCharLength('', 3)).toBe(true);
        });
    });

    describe('containsNumericCharacters', () => {
        it('should return true when password contains numeric characters', () => {
            expect(containsNumericCharacters('Password1')).toBe(true);
            expect(containsNumericCharacters('Pass123word')).toBe(true);
            expect(containsNumericCharacters('0Password')).toBe(true);
            expect(containsNumericCharacters('9')).toBe(true);
        });

        it('should return false when password contains no numeric characters', () => {
            expect(containsNumericCharacters('Password')).toBe(false);
            expect(containsNumericCharacters('UPPERCASE')).toBe(false);
            expect(containsNumericCharacters('lowercase')).toBe(false);
            expect(containsNumericCharacters('Pass!@#word')).toBe(false);
        });

        it('should return true for all digits 0-9', () => {
            expect(containsNumericCharacters('0')).toBe(true);
            expect(containsNumericCharacters('1')).toBe(true);
            expect(containsNumericCharacters('2')).toBe(true);
            expect(containsNumericCharacters('3')).toBe(true);
            expect(containsNumericCharacters('4')).toBe(true);
            expect(containsNumericCharacters('5')).toBe(true);
            expect(containsNumericCharacters('6')).toBe(true);
            expect(containsNumericCharacters('7')).toBe(true);
            expect(containsNumericCharacters('8')).toBe(true);
            expect(containsNumericCharacters('9')).toBe(true);
        });

        it('should return false for empty string', () => {
            expect(containsNumericCharacters('')).toBe(false);
        });
    });

    describe('containsAsciiLowerCase', () => {
        it('should return true when password contains lowercase characters', () => {
            expect(containsAsciiLowerCase('Password')).toBe(true);
            expect(containsAsciiLowerCase('PASS1word')).toBe(true);
            expect(containsAsciiLowerCase('a')).toBe(true);
            expect(containsAsciiLowerCase('z')).toBe(true);
        });

        it('should return false when password contains no lowercase characters', () => {
            expect(containsAsciiLowerCase('PASSWORD')).toBe(false);
            expect(containsAsciiLowerCase('PASS123')).toBe(false);
            expect(containsAsciiLowerCase('123!@#')).toBe(false);
        });

        it('should return true for all lowercase letters a-z', () => {
            expect(containsAsciiLowerCase('abcdefghijklmnopqrstuvwxyz')).toBe(true);
        });

        it('should return false for empty string', () => {
            expect(containsAsciiLowerCase('')).toBe(false);
        });
    });

    describe('containsAsciiUpperCase', () => {
        it('should return true when password contains uppercase characters', () => {
            expect(containsAsciiUpperCase('Password')).toBe(true);
            expect(containsAsciiUpperCase('passWORD')).toBe(true);
            expect(containsAsciiUpperCase('A')).toBe(true);
            expect(containsAsciiUpperCase('Z')).toBe(true);
        });

        it('should return false when password contains no uppercase characters', () => {
            expect(containsAsciiUpperCase('password')).toBe(false);
            expect(containsAsciiUpperCase('pass123')).toBe(false);
            expect(containsAsciiUpperCase('123!@#')).toBe(false);
        });

        it('should return true for all uppercase letters A-Z', () => {
            expect(containsAsciiUpperCase('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true);
        });

        it('should return false for empty string', () => {
            expect(containsAsciiUpperCase('')).toBe(false);
        });
    });

    describe('containsAsciiLetterCharacters', () => {
        it('should return true when password contains ASCII letter characters', () => {
            expect(containsAsciiLetterCharacters('Password')).toBe(true);
            expect(containsAsciiLetterCharacters('Pass123')).toBe(true);
            expect(containsAsciiLetterCharacters('a')).toBe(true);
            expect(containsAsciiLetterCharacters('Z')).toBe(true);
        });

        it('should return false when password contains no ASCII letter characters', () => {
            expect(containsAsciiLetterCharacters('123456')).toBe(false);
            expect(containsAsciiLetterCharacters('!@#$%')).toBe(false);
            expect(containsAsciiLetterCharacters('123!@#')).toBe(false);
        });

        it('should return true for mixed case letters', () => {
            expect(containsAsciiLetterCharacters('AaBbCc')).toBe(true);
        });

        it('should return false for empty string', () => {
            expect(containsAsciiLetterCharacters('')).toBe(false);
        });
    });

    describe('validatePasswordFormat', () => {
        const defaultConfig: TenantPasswordConfig = {
            tenantId: 'test-tenant',
            passwordMinLength: 8,
            passwordMaxLength: 128,
            requireNumbers: true,
            requireLowerCase: true,
            requireUpperCase: true,
            requireSpecialCharacters: true,
            specialCharactersAllowed: DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED,
            maxRepeatingCharacterLength: 3,
            requireMfa: false
        };

        it('should validate a password that meets all requirements', () => {
            const result = validatePasswordFormat('Password123!', defaultConfig);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
            expect(result.password).toBe('Password123!');
        });

        it('should return error when password is too short', () => {
            const result = validatePasswordFormat('Pass1!', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_INVALID_LENGTH');
        });

        it('should return error when password is too long', () => {
            const longPassword = 'P'.repeat(129) + 'a1!';
            const result = validatePasswordFormat(longPassword, defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_INVALID_LENGTH');
        });

        it('should return error when password has leading space', () => {
            const result = validatePasswordFormat(' Password123!', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_HAS_LEADING_OR_TRAILING_SPACES');
        });

        it('should return error when password has trailing space', () => {
            const result = validatePasswordFormat('Password123! ', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_HAS_LEADING_OR_TRAILING_SPACES');
        });

        it('should return error when password has invalid characters', () => {
            const result = validatePasswordFormat('Password123\n!', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_HAS_INVALID_CHARACTERS');
        });

        it('should return error when password contains no numeric characters', () => {
            const result = validatePasswordFormat('Password!', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_NUMERIC_CHARACTERS');
        });

        it('should return error when password contains no lowercase characters', () => {
            const result = validatePasswordFormat('PASSWORD123!', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_LOWERCASE_CHARACTERS');
        });

        it('should return error when password contains no uppercase characters', () => {
            const result = validatePasswordFormat('password123!', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_UPPERCASE_CHARACTERS');
        });

        it('should return error when password contains no special characters', () => {
            const result = validatePasswordFormat('Password123', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_ALLOWED_SPECIAL_CHARACTERS');
        });

        it('should return error when password contains repeating characters', () => {
            const result = validatePasswordFormat('Passsssword123!', defaultConfig);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_REPEATING_CHARACTERS');
        });

        it('should skip lowercase check when password has no ASCII letters', () => {
            const config = { ...defaultConfig, requireLowerCase: true };
            const result = validatePasswordFormat('12345678!@#', config);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should skip uppercase check when password has no ASCII letters', () => {
            const config = { ...defaultConfig, requireUpperCase: true };
            const result = validatePasswordFormat('12345678!@#', config);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should work with minimal requirements', () => {
            const minimalConfig: TenantPasswordConfig = {
                tenantId: 'test-tenant',
                passwordMinLength: 4,
                passwordMaxLength: 20,
                requireNumbers: false,
                requireLowerCase: false,
                requireUpperCase: false,
                requireSpecialCharacters: false,
                specialCharactersAllowed: null,
                maxRepeatingCharacterLength: null,
                requireMfa: false
            };
            const result = validatePasswordFormat('pass', minimalConfig);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should use default special characters when specialCharactersAllowed is null', () => {
            const config = { ...defaultConfig, specialCharactersAllowed: null };
            const result = validatePasswordFormat('Password123_', config);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should allow password without repeating check when maxRepeatingCharacterLength is null', () => {
            const config = { ...defaultConfig, maxRepeatingCharacterLength: null };
            const result = validatePasswordFormat('Passsssword123!', config);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should validate password with exactly minimum length', () => {
            const result = validatePasswordFormat('Pass123!', defaultConfig);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should validate password with exactly maximum length', () => {
            // Create a 128-char password without repeating characters more than 3 times
            const password = 'Passw0rd!' + 'Abc123!'.repeat(17); // 9 + 119 = 128
            const result = validatePasswordFormat(password, defaultConfig);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should allow spaces in the middle of password', () => {
            const result = validatePasswordFormat('Pass word 123!', defaultConfig);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should validate password with multiple special characters', () => {
            const result = validatePasswordFormat('P@ssw0rd!#$', defaultConfig);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should validate password with Unicode letters', () => {
            const config = { ...defaultConfig, requireNumbers: false, requireSpecialCharacters: false };
            const result = validatePasswordFormat('Pàsswörd', config);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should validate with custom special characters allowed list', () => {
            const config = { ...defaultConfig, specialCharactersAllowed: '!@#$%' };
            const result = validatePasswordFormat('Password123!', config);
            expect(result.result).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should fail when special character not in custom allowed list', () => {
            const config = { ...defaultConfig, specialCharactersAllowed: '!@#$%' };
            const result = validatePasswordFormat('Password123&', config);
            expect(result.result).toBe(false);
            expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_ALLOWED_SPECIAL_CHARACTERS');
        });
    });
});
