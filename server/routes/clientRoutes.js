const express = require('express');
const router = express.Router();
const {
  getClients, getClient, createClient, updateClient, deleteClient, getClientLoans,
} = require('../controllers/clientController');
const { protect, notViewer, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);

router.route('/')
  .get(getClients)
  .post(notViewer, upload.fields([{ name: 'id_proof', maxCount: 1 }, { name: 'address_proof', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), createClient);

router.route('/:id')
  .get(getClient)
  .put(notViewer, updateClient)
  .delete(authorize('admin'), deleteClient);

router.get('/:id/loans', getClientLoans);

module.exports = router;
