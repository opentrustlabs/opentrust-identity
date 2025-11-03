/**
 * Tests for Password Utilities - Real Implementation
 *
 * This tests the actual password-utils functions from the codebase
 */

import { describe, it, expect } from '@jest/globals';
import {
  validatePasswordFormat,
  getUnicodeCategory,
  containsSpecialCharacterInAllowedList,
} from '@/utils/password-utils';
import { TenantPasswordConfig } from '@/graphql/generated/graphql-types';
import { PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS } from '@/utils/consts';

describe('Password Utilities - Real Implementation', () => {
  const defaultPasswordConfig: TenantPasswordConfig = {
      passwordMinLength: 8,
      passwordMaxLength: 128,
      requireNumbers: true,
      requireLowerCase: true,
      requireUpperCase: true,
      requireSpecialCharacters: true,
      specialCharactersAllowed: '!@#$%^&*()_+-=[]{};\':"|,.<>/?',
      maxRepeatingCharacterLength: 3,
      passwordHashingAlgorithm: '',
      requireMfa: false,
      tenantId: 'test-tenant-id'
  };

  describe('validatePasswordFormat', () => {
    it('should accept a valid password that meets all requirements', () => {
      const result = validatePasswordFormat('ValidPass123!', defaultPasswordConfig);

      expect(result.result).toBe(true);
      expect(result.errorMessage).toBe('');
      expect(result.password).toBe('ValidPass123!');
    });

    it('should reject password that is too short', () => {
      const result = validatePasswordFormat('Short1!', defaultPasswordConfig);

      expect(result.result).toBe(false);
      expect(result.errorMessage).toBe('ERROR_PASSWORD_INVALID_LENGTH');
    });

    it('should reject password that is too long', () => {
      const longPassword = 'A'.repeat(129) + 'a1!';
      const result = validatePasswordFormat(longPassword, defaultPasswordConfig);

      expect(result.result).toBe(false);
      expect(result.errorMessage).toBe('ERROR_PASSWORD_INVALID_LENGTH');
    });

    it('should reject password with leading space', () => {
      const result = validatePasswordFormat(' ValidPass123!', defaultPasswordConfig);

      expect(result.result).toBe(false);
      expect(result.errorMessage).toBe('ERROR_PASSWORD_HAS_LEADING_OR_TRAILING_SPACES');
    });

    it('should reject password with trailing space', () => {
      const result = validatePasswordFormat('ValidPass123! ', defaultPasswordConfig);

      expect(result.result).toBe(false);
      expect(result.errorMessage).toBe('ERROR_PASSWORD_HAS_LEADING_OR_TRAILING_SPACES');
    });

    it('should reject password without uppercase letter when required', () => {
      const result = validatePasswordFormat('validpass123!', defaultPasswordConfig);

      expect(result.result).toBe(false);
      expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_UPPERCASE_CHARACTERS');
    });

    it('should reject password without lowercase letter when required', () => {
      const result = validatePasswordFormat('VALIDPASS123!', defaultPasswordConfig);

      expect(result.result).toBe(false);
      expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_LOWERCASE_CHARACTERS');
    });

    it('should reject password without numbers when required', () => {
      const result = validatePasswordFormat('ValidPassword!', defaultPasswordConfig);

      expect(result.result).toBe(false);
      expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_NUMERIC_CHARACTERS');
    });

    it('should reject password without special characters when required', () => {
      const result = validatePasswordFormat('ValidPass123', defaultPasswordConfig);

      expect(result.result).toBe(false);
      expect(result.errorMessage).toBe('ERROR_PASSWORD_CONTAINS_NO_ALLOWED_SPECIAL_CHARACTERS');
    });

    it('should accept password when uppercase is not required', () => {
      const config = { ...defaultPasswordConfig, requireUpperCase: false };
      const result = validatePasswordFormat('validpass123!', config);

      expect(result.result).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should accept password when lowercase is not required', () => {
      const config = { ...defaultPasswordConfig, requireLowerCase: false };
      const result = validatePasswordFormat('VALIDPASS123!', config);

      expect(result.result).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should accept password when numbers are not required', () => {
      const config = { ...defaultPasswordConfig, requireNumbers: false };
      const result = validatePasswordFormat('ValidPassword!', config);

      expect(result.result).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should accept password when special characters are not required', () => {
      const config = { ...defaultPasswordConfig, requireSpecialCharacters: false };
      const result = validatePasswordFormat('ValidPass123', config);

      expect(result.result).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should accept password at minimum length boundary', () => {
      const result = validatePasswordFormat('Valid12!', defaultPasswordConfig);

      expect(result.result).toBe(true);
    });

    it('should accept password at maximum length boundary', () => {
      // Create a password exactly at max length (128 chars) without repeating chars
      // Pattern: AaBb repeated to avoid maxRepeatingCharacterLength of 3
      const pattern = 'AaBb';
      const repeats = Math.floor(124 / pattern.length); // 124 chars from pattern
      const maxLengthPassword = pattern.repeat(repeats) + '123!'; // 124 + 4 = 128

      const result = validatePasswordFormat(maxLengthPassword, defaultPasswordConfig);

      expect(maxLengthPassword.length).toBe(128);
      expect(result.result).toBe(true);
    });

    it('should handle passwords with various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];

      specialChars.forEach((char) => {
        const password = `ValidPass123${char}`;
        const result = validatePasswordFormat(password, defaultPasswordConfig);
        expect(result.result).toBe(true);
      });
    });

    it('should work with relaxed password requirements', () => {
      const relaxedConfig: TenantPasswordConfig = {
        passwordMinLength: 4,
        passwordMaxLength: 256,
        requireNumbers: false,
        requireLowerCase: true,
        requireUpperCase: false,
        requireSpecialCharacters: false,
        specialCharactersAllowed: '',
        maxRepeatingCharacterLength: null,
        passwordHashingAlgorithm: PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS,
        requireMfa: false,
        tenantId: 'test-tenant-id'
      };

      const result = validatePasswordFormat('simplepassword', relaxedConfig);

      expect(result.result).toBe(true);
    });
  });

  describe('getUnicodeCategory', () => {
    it('should identify letters', () => {
      expect(getUnicodeCategory('A')).toBe('Letter');
      expect(getUnicodeCategory('a')).toBe('Letter');
      expect(getUnicodeCategory('Z')).toBe('Letter');
      expect(getUnicodeCategory('z')).toBe('Letter');
    });

    it('should identify numbers', () => {
      expect(getUnicodeCategory('0')).toBe('Number');
      expect(getUnicodeCategory('5')).toBe('Number');
      expect(getUnicodeCategory('9')).toBe('Number');
    });

    it('should identify symbols', () => {
      expect(getUnicodeCategory('$')).toBe('Symbol');
      expect(getUnicodeCategory('+')).toBe('Symbol');
    });

    it('should identify punctuation', () => {
      expect(getUnicodeCategory('!')).toBe('Punctuation');
      expect(getUnicodeCategory('.')).toBe('Punctuation');
      expect(getUnicodeCategory(',')).toBe('Punctuation');
    });

    it('should identify separators', () => {
      expect(getUnicodeCategory(' ')).toBe('Separator');
    });
  });

  describe('containsSpecialCharacterInAllowedList', () => {
    const allowedSpecialChars = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';

    it('should return true if password contains allowed special character', () => {
      expect(containsSpecialCharacterInAllowedList('Password123!', allowedSpecialChars)).toBe(true);
      expect(containsSpecialCharacterInAllowedList('Password123@', allowedSpecialChars)).toBe(true);
      expect(containsSpecialCharacterInAllowedList('Password123#', allowedSpecialChars)).toBe(true);
    });

    it('should return false if password contains no special characters', () => {
      expect(containsSpecialCharacterInAllowedList('Password123', allowedSpecialChars)).toBe(false);
    });

    it('should return false if password contains only non-allowed special characters', () => {
      const limitedAllowedChars = '!@#';
      expect(containsSpecialCharacterInAllowedList('Password123$', limitedAllowedChars)).toBe(false);
    });

    it('should return true if password contains multiple allowed special characters', () => {
      expect(containsSpecialCharacterInAllowedList('Pass!@#123', allowedSpecialChars)).toBe(true);
    });

    it('should handle empty allowed list', () => {
      expect(containsSpecialCharacterInAllowedList('Password123!', '')).toBe(false);
    });

    it('should handle empty password', () => {
      expect(containsSpecialCharacterInAllowedList('', allowedSpecialChars)).toBe(false);
    });
  });
});
