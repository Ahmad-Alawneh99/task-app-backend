import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import * as tokenUtils from './tokenUtils';

export const isUserLoggedIn = (req: Request, res: Response, next: NextFunction) => {
	const cookies = req.headers.cookie || '';

	try {
		const taskAppToken = cookies.split(';').find((cookie) => cookie.trim().startsWith('task_app_token'))?.split('=')[1] || '';
		const validatedToken = tokenUtils.verifyToken(taskAppToken) as JwtPayload;

		req.params.userId = validatedToken.id as string;

		return next();
	} catch (error) {
		return res.status(401).send({ success: false, code: 401, message: 'Authentication required' });
	}
};
