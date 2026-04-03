const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/slotController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', ctrl.getSlots);
router.get('/mine', ctrl.getMyBookings);
router.post(
  '/book',
  [
    body('date').isISO8601().withMessage('A valid booking date is required.'),
    body('startTime').matches(/^(0[6-9]|1[0-9]|20|21):00$/).withMessage('Start time must be an hourly slot between 06:00 and 21:00.'),
  ],
  validate,
  ctrl.bookSlot
);
router.delete('/:id', ctrl.cancelBooking);

module.exports = router;
