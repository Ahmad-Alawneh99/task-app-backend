import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as tokenUtils from '../shared/tokenUtils';
import User from '../models/user';
import * as validationUtils from '../shared/validationUtils';
import { isUserLoggedIn } from '../shared/authUtils';

const userRouter = express.Router();

const handleUserSignup = async (req: Request, res: Response) => {
	const { email, password, name } = req.body;

	if (!validationUtils.isValidEmail(email)) {
		return res.status(400).send({ success: false, code: 400, message: 'Email is missing or invalid.' });
	}

	if (!validationUtils.isStrongPassword(password)) {
		return res.status(400).send({ success: false, code: 400, message: 'Weak password.' });
	}

	const hashedPassword = await bcrypt.hash(password, 16);
	const user = new User({ email, password: hashedPassword, name });
	try {
		await user.save();
	} catch (error) {
		console.log(error);
		if (error.code === 11000) {
			return res.status(409).send({ success: false, code: 409, message: 'Email already exists.' });
		} else {
			return res.status(500).send({ success: false, code: 500, message: error.message });

		}
	}
	const token = tokenUtils.signToken({ email: user.email, id: user.id });

	return res.status(201).send({ success: true, message: 'User created successfully', token });
};

const handleUserSignIn = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).send({ success: false, code: 400, message: 'Email and password are required.' });
	}

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).send({ success: false, code: 400, message: 'Invalid email or password.' });
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).send({ success: false, code: 400, message: 'Invalid email or password.' });
		}
		const token = tokenUtils.signToken({ id: user.id, email: user.email });

		return res.status(200).send({ success: true, token });
	} catch (error) {
		console.error('Error:', error);

		return res.status(500).send({ success: false, code: 500, message: error.message });
	}
};

const getUserProfile = async (req: Request, res: Response) => {
	const { userId } = req.params;

	try {
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(400).send({ success: false, code: 400, message: 'Profile info not found' });
		}

		user.password = ''; // do not return password with the response

		return res.status(200).send({ success: true, code: 200, user });
	} catch (error) {
		console.error('Error:', error);

		return res.status(500).send({ success: false, code: 500, message: error.message });
	}
};

userRouter.post('/sign-in', handleUserSignIn);
userRouter.post('/sign-up', handleUserSignup);
userRouter.get('/me', isUserLoggedIn, getUserProfile);

export default userRouter;
