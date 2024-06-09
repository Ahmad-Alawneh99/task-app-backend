import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { isUserLoggedIn } from '../shared/authUtils';
import { getFirebaseAdminInstance } from '../shared/firebaseUtils';

const taskRouter = express.Router();

interface Task {
	title: string;
	description?: string;
	completed: boolean;
	ownerId: string;
	createdAt: number,
	updatedAt: number,
}

interface TaskWithId extends Task {
	id: string;
}

const createTask = async (req: Request, res: Response) => {
	const { title = '', description = '', completed = false } = req.body;

	if (!title) {
		return res.status(400).send({ success: false, code: 400, message: 'Task title is required' });
	}

	try {
		const now = DateTime.now().toMillis();

		const task: Task = {
			title,
			description,
			completed,
			ownerId: req.params.userId as string,
			createdAt: now,
			updatedAt: now,
		};

		const db = getFirebaseAdminInstance().collection('tasks');
		await db.doc(uuidv4()).create(task);

		return res.status(201).send({ success: true, code: 201, message: 'Task created successfully' });
	} catch (error) {
		return res.status(500).send({ success: false, code: 400, message: 'Something went wrong when creating the task' });
	}
};

const updateTask = async (req: Request, res: Response) => {
	const { title = '', description = '', completed = false, taskId = '' } = req.body;
	const userId = req.params.userId;

	if (!taskId) {
		return res.status(400).send({ success: false, code: 400, message: 'Task id is required' });
	}

	try {
		const db = getFirebaseAdminInstance().collection('tasks');
		const existingTask = await db.doc(taskId).get();

		if (!existingTask.exists) {
			return res.status(400).send({ success: false, code: 400, message: 'Task not found' });
		}

		const existingTaskData = existingTask.data() as Task;

		if (existingTaskData.ownerId !== userId) {
			return res.status(403).send({ success: false, code: 403, message: 'You don\'t have access to update this task' });
		}

		const task: Partial<Task> = {
			...title ? { title } : {},
			...description ? { description } : {},
			completed,
			updatedAt: DateTime.now().toMillis(),
		};

		await db.doc(taskId).update(task);

		return res.status(200).send({ success: true, code: 200, message: 'Task updated successfully' });
	} catch (error) {
		return res.status(500).send({ success: false, code: 500, message: 'Something went wrong when updating the task' });

	}
};

const deleteTask = async (req: Request, res: Response) => {
	const { userId, taskId } = req.params;

	if (!taskId) {
		return res.status(400).send({ success: false, code: 400, message: 'Task id is required' });
	}

	try {
		const db = getFirebaseAdminInstance().collection('tasks');
		const task = await db.doc(taskId).get();

		if (!task.exists) {
			return res.status(400).send({ success: false, code: 400, message: 'Task not found' });
		}

		const taskData = task.data() as Task;

		if (taskData.ownerId !== userId) {
			return res.status(403).send({ success: false, code: 403, message: 'You don\'t have access to delete this task' });
		}

		await db.doc(taskId).delete();

		return res.status(200).send({ success: true, code: 200, message: 'Task deleted successfully' });
	} catch (error) {
		return res.status(500).send({ success: false, code: 500, message: 'Something went wrong when deleting the task' });

	}
};

const getTasks = async (req: Request, res: Response) => {
	const { userId } = req.params;

	try {
		const db = getFirebaseAdminInstance().collection('tasks');
		const tasks = await db.where('ownerId', '==', userId).get();

		const preparedTasks: TaskWithId[] = [];
		tasks.forEach((task) => {
			const preparedTask = task.data() as TaskWithId;
			preparedTask.id = task.id;
			preparedTasks.push(preparedTask);
		});

		return res.status(200).send({ success: true, code: 200, tasks: preparedTasks });
	} catch (error) {
		return res.status(500).send({ success: false, code: 500, message: 'Something went wrong when deleting the task' });

	}
};

const getTaskById = async (req: Request, res: Response) => {
	const { userId, taskId } = req.params;

	if (!taskId) {
		return res.status(400).send({ success: false, code: 400, message: 'Task id is required' });
	}

	try {
		const db = getFirebaseAdminInstance().collection('tasks');
		const task = await db.doc(taskId).get();

		if (!task.exists) {
			return res.status(400).send({ success: false, code: 400, message: 'Task not found' });
		}

		const taskData = task.data() as Task;

		if (taskData.ownerId !== userId) {
			return res.status(403).send({ success: false, code: 403, message: 'You don\'t have access to retrieve this task' });
		}

		return res.status(200).send({ success: true, code: 200, task: taskData });
	} catch (error) {
		return res.status(500).send({ success: false, code: 500, message: 'Something went wrong when retrieving the task' });

	}
};

taskRouter.post('/create', isUserLoggedIn, createTask);
taskRouter.put('/update', isUserLoggedIn, updateTask);
taskRouter.delete('/delete/:taskId', isUserLoggedIn, deleteTask);
taskRouter.get('/getAll', isUserLoggedIn, getTasks);
taskRouter.get('/get/:taskId', isUserLoggedIn, getTaskById);

export default taskRouter;
