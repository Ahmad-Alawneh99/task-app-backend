import { expect } from 'chai';
import rewire from 'rewire';
import sinon from 'sinon';
import mongoose from 'mongoose';

const dbConnect = rewire('./dbConnect.ts');

describe('authUtils', () => {
	describe('connectToMongoDB', () => {
		const connectToMongoDB = dbConnect.__get__('connectToMongoDB');

		it('should connect to mongodb correctly', async () => {
			const mockMongooseConnect = sinon.stub().resolves();
			const mockConsoleLog = sinon.stub();
			mongoose.connect = mockMongooseConnect;

			dbConnect.__set__({
				console: {
					log: mockConsoleLog,
				},
			});

			process.env.MONGODB_CONNECTION = 'mockMongodbURL';

			await connectToMongoDB();

			expect(mockMongooseConnect).to.have.been.calledWith('mockMongodbURL');
			expect(mockConsoleLog).to.have.been.calledWith('Connected to MongoDB');
		});

		it('should throw if connection to mongodb fails', async () => {
			const mockMongooseConnect = sinon.stub().rejects('error');
			const mockConsoleError = sinon.stub();
			mongoose.connect = mockMongooseConnect;

			dbConnect.__set__({
				console: {
					error: mockConsoleError,
				},
			});

			process.env.MONGODB_CONNECTION = undefined;

			await connectToMongoDB();

			expect(mockConsoleError).to.have.been.calledWith('Error connecting to MongoDB');
		});
	});
});
