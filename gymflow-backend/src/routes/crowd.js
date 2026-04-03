const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/crowdController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/current', protect, ctrl.getCurrent);
router.get('/hourly', protect, ctrl.getHourly);
router.get('/weekly', protect, ctrl.getWeekly);
router.post('/checkin', protect, ctrl.checkIn);
router.post('/checkout', protect, ctrl.checkOut);
router.post(
  '/override',
  protect,
  adminOnly,
  [
    body('crowdPct').isInt({ min: 0, max: 100 }).withMessage('Crowd percentage must be between 0 and 100.'),
    body('checkedIn').optional({ values: 'falsy' }).isInt({ min: 0, max: 200 }).withMessage('Checked-in count must be between 0 and 200.'),
  ],
  validate,
  ctrl.overrideCrowd
);
router.post(
  '/broadcast',
  protect,
  adminOnly,
  [
    body('message').trim().notEmpty().withMessage('Broadcast message is required.').isLength({ max: 300 }).withMessage('Broadcast message is too long.'),
    body('type').optional().isIn(['info', 'warning', 'alert']).withMessage('Invalid broadcast type.'),
  ],
  validate,
  ctrl.broadcast
);

module.exports = router;
