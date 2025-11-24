import express from 'express';
import userMiddleware from '../middleware/user.middleware';
import userController from '../controllers/user.controller';
import aclMiddleware from '../middleware/acl.middleware';
import { USER_STATUS } from '../utils/constants';
import mediaMiddleware from '../middleware/media.middleware';
import mediaController from '../controllers/media.controller';
import bukuController from '../controllers/buku.controller';
import peminjamanController from '../controllers/peminjaman.controller';
import pengembalianController from '../controllers/pengembalian.controller';

const router = express.Router();

// User
router.post('/user/register', userController.register);
router.post('/user/login', userController.login);
router.get('/user/profile', userMiddleware, userController.profile);
router.patch('/user/ubah/:id', userMiddleware, userController.ubahProfil);
router.patch('/user/blokir/:id', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN])], userController.blokirAkun);
router.patch('/user/ubah-alamat/:id', userMiddleware, userController.ubahAlamat);

// Media
router.post('/media/upload', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN]), mediaMiddleware.single('file')], mediaController.single);
router.delete('/media/delete', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN])], mediaController.delete);

// Buku
router.post('/buku/buat', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN])], bukuController.buatBuku);
router.get('/buku/list', bukuController.listBuku);
router.get('/buku/:id', bukuController.lihatBuku);
router.patch('/buku/ubah/:id', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN])], bukuController.ubahBuku);
router.delete('/buku/hapus/:id', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN])], bukuController.hapusBuku);
router.patch('/buku/tambah-stok/:id', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN])], bukuController.tambahStok);
router.patch('/buku/kurangi-stok/:id', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN])], bukuController.kurangiStok);

// Peminjaman
router.post('/peminjaman/buat', [userMiddleware, aclMiddleware([USER_STATUS.MEMBER])], peminjamanController.buatPeminjaman);
router.patch('/peminjaman/ubah-status/:id', [userMiddleware, aclMiddleware([USER_STATUS.ADMIN])], peminjamanController.ubahStatus);
// hitung denda
router.get('/peminjaman/hitung-denda/:id', [userMiddleware, aclMiddleware([USER_STATUS.MEMBER, USER_STATUS.ADMIN])], peminjamanController.hitungDenda);

// Pengembalian
router.post('/pengembalian/proses/:barcode', [userMiddleware, aclMiddleware([USER_STATUS.MEMBER])], pengembalianController.prosesPengembalian);

export default router;