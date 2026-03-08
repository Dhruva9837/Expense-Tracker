const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupLoans,
  getGroupPayments,
  getGroupPerformance,
} = require('../controllers/groupController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getGroups)
  .post(createGroup);

router.get('/:id/loans', getGroupLoans);
router.get('/:id/payments', getGroupPayments);
router.get('/:id/performance', getGroupPerformance);

router.route('/:id')
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

module.exports = router;
