import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectToMongoDB } from './shared/dbConnect';
import userRouter from './routers/userRoutes';
import { initializeFirebase } from './shared/firebaseUtils';
import taskRouter from './routers/taskRoutes';

dotenv.config();
const app = express();
const port = 3030;
initializeFirebase();
connectToMongoDB().catch((error) => console.log('failed to connect to mongodb', error));

app.use(express.json());
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
}));

app.get('/', (req: Request, res: Response) => {
	return res.send('Task app backend');
});

app.use('/users', userRouter);
app.use('/tasks', taskRouter);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
