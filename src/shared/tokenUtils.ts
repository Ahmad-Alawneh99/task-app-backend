import * as jwt from 'jsonwebtoken';

export const signToken = (payload): string => {
	return jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret);
};

export const verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
};
