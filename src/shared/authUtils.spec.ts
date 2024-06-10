/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai';
import { Request, Response } from 'express';
import rewire from 'rewire';
import sinon from 'sinon';

const authUtils = rewire('./authUtils.ts');

describe('authUtils', () => {
	describe('isUserLoggedIn', () => {
		const isUserLoggedIn = authUtils.__get__('isUserLoggedIn');

		it('should append userId to the request if a valid token is passed with the request\'s cookie', () => {
			const mockRequest: Partial<Request> = {
				headers: {
					cookie: 'task_app_token=mockValidCookie',
				},
				params: {},
			};

			const mockNext = sinon.stub();

			authUtils.__set__({
				tokenUtils: {
					verifyToken: sinon.stub().returns({ id: 'mockUserId' }),
				},
			});

			isUserLoggedIn(mockRequest, {}, mockNext);

			expect(mockNext).to.have.been.called;
			expect(mockRequest.params!.userId).to.deep.equal('mockUserId');
		});

		it('should throw if token is not valid or not provided', () => {
			const mockRequest: Partial<Request> = {
				headers: {
					cookie: undefined,
				},
				params: {},
			};

			const mockResponse: Partial<Response> = {
				status: sinon.stub().returnsThis(),
				send: sinon.stub(),
			};

			const mockNext = sinon.stub();

			authUtils.__set__({
				tokenUtils: {
					verifyToken: sinon.stub().throws({ message: 'invalid token' }),
				},
			});

			isUserLoggedIn(mockRequest, mockResponse, mockNext);

			expect(mockNext).not.to.have.been.called;
			expect(mockResponse.send).to.have.been.calledWith({ success: false, code: 401, message: 'Authentication required' });
		});
	});
});
