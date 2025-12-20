import express from 'express';

import UserController from '../controllers/user.controller';
import ACLMiddleware from '../middleware/acl.middleware';
import { USER_STATUS } from '../utils/constants';
import MediaController from '../controllers/media.controller';
import BukuController from '../controllers/buku.controller';
import PeminjamanController from '../controllers/peminjaman.controller';
import pengembalianController from '../controllers/pengembalian.controller';
import UserMiddleware from '../middleware/user.middleware';
import UploadMiddleware from '../middleware/media.middleware';

const router = express.Router();
const auth = new UserMiddleware();
const aclMiddleware = new ACLMiddleware();


// User
router.post('/user/register', UserController.register);
router.post('/user/login', UserController.login);
router.get('/user/profile', auth.handle, UserController.profile);
router.patch('/user/ubah/:id', auth.handle, UserController.ubahProfil);
router.patch('/user/ubah-alamat/:id', auth.handle, UserController.ubahAlamat);

// Media
router.post('/media/upload', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN]), UploadMiddleware.single('file')], MediaController.single);
router.delete('/media/delete', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], MediaController.delete);

// Buku
router.post('/buku/buat', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], BukuController.buatBuku);
router.get('/buku/list', BukuController.listBuku);
router.get('/buku/populer', BukuController.bukuPopuler);
router.get('/buku/:id', BukuController.lihatBuku);
router.patch('/buku/ubah/:id', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], BukuController.ubahBuku);
router.delete('/buku/hapus/:id', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], BukuController.hapusBuku);
router.patch('/buku/tambah-stok/:id', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], BukuController.tambahStok);
router.patch('/buku/kurangi-stok/:id', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], BukuController.kurangiStok);
// Peminjaman
router.get('/peminjaman/list', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], PeminjamanController.daftarSemuaPeminjaman);
router.get('/peminjaman/user/:id', [auth.handle, aclMiddleware.handle([USER_STATUS.MEMBER, USER_STATUS.ADMIN])], PeminjamanController.daftarPeminjamanUser);
router.post('/peminjaman/buat', [auth.handle, aclMiddleware.handle([USER_STATUS.MEMBER])], PeminjamanController.buatPeminjaman);
router.patch('/peminjaman/konfirmasi/:barcode', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], PeminjamanController.konfirmasiPeminjaman);
router.get('/peminjaman/cari/:barcode', [auth.handle, aclMiddleware.handle([USER_STATUS.MEMBER, USER_STATUS.ADMIN])], PeminjamanController.cariPeminjaman);

// hitung denda
router.get('/peminjaman/hitung-denda/:barcode', [auth.handle, aclMiddleware.handle([USER_STATUS.MEMBER, USER_STATUS.ADMIN])], PeminjamanController.hitungDenda);

// Pengembalian
router.patch('/pengembalian/proses/:barcode', [auth.handle, aclMiddleware.handle([USER_STATUS.MEMBER])], pengembalianController.prosesPengembalian);
router.post('/pengembalian/konfirmasi/:barcode', [auth.handle, aclMiddleware.handle([USER_STATUS.ADMIN])], pengembalianController.konfirmasiPengembalian);
router.get('/pengembalian/cari/:barcode', [auth.handle, aclMiddleware.handle([USER_STATUS.MEMBER, USER_STATUS.ADMIN])], pengembalianController.cariPengembalian);

export default router;