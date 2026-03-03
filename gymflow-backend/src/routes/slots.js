const router = require('express').Router();
const ctrl   = require('../controllers/slotController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',           ctrl.getSlots);
router.get('/mine',       ctrl.getMyBookings);
router.post('/book',      ctrl.bookSlot);
router.delete('/:id',     ctrl.cancelBooking);

module.exports = router;
