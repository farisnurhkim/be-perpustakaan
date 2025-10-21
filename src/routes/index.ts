import express from 'express';
import userMiddleware from '../middleware/user.middleware';
import userController from '../controllers/user.controller';

const router = express.Router();

// User
router.post('/user/register', userController.register);
router.post('/user/login', userController.login);
router.get('/user/profile', userMiddleware, userController.profile);
router.patch('/user/ubah/:id', userMiddleware, userController.ubahProfil);
router.patch('/user/blokir/:id', userMiddleware, userController.blokirAkun);


export default router;