/* eslint-disable no-undef */

import { expect } from 'chai';
import rewire from 'rewire';

const validationUtils = rewire('./validationUtils');

describe('participantValidation', () => {
	describe('isValidEmail', () => {
		const isValidEmail = validationUtils.__get__('isValidEmail');

		it('should return true for valid email', () => {
			expect(isValidEmail('test@example.com')).to.be.true;
			expect(isValidEmail('a1212A@somethingrandom.com')).to.be.true;
			expect(isValidEmail('a@ebx.com')).to.be.true;
		});

		it('should return false for invalid email', () => {
			expect(isValidEmail('a@b.c')).to.be.false;
			expect(isValidEmail('a@123.c')).to.be.false;
			expect(isValidEmail('invalid-email')).to.be.false;
		});

		it('should safety check and return false', () => {
			expect(isValidEmail()).to.be.false;
		});
	});

	describe('isStrongPassword', () => {
		const isStrongPassword = validationUtils.__get__('isStrongPassword');

		it('should return true for valid password', () => {
			expect(isStrongPassword('validPassword?1')).to.be.true;
		});

		it('should return false for password less than 8 characters', () => {
			expect(isStrongPassword('short')).to.be.false;
		});

		it('should return false for password that doesn\'t contain numbers', () => {
			expect(isStrongPassword('noNumbers!')).to.be.false;
		});

		it('should return false for password that doesn\'t contain an upper case letter', () => {
			expect(isStrongPassword('noupper12!')).to.be.false;
		});

		it('should return false for password that doesn\'t contain a special character', () => {
			expect(isStrongPassword('passworD1')).to.be.false;
		});

		it('should safety check and return false', () => {
			expect(isStrongPassword()).to.be.false;
		});
	});
});
