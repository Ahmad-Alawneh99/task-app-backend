import mongoose from 'mongoose';

export async function connectToMongoDB() {
	try {
		await mongoose.connect(process.env.MONGODB_CONNECTION || '');
		console.log('Connected to MongoDB');
	} catch (error) {
		console.error('Error connecting to MongoDB', error);
	}
}
