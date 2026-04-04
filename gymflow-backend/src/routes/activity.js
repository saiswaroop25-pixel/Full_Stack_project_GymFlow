const router = require('express').Router();
const ctrl   = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/notifications', ctrl.getNotifications);
router.get('/attendance', ctrl.getAttendance);
router.get('/stats',      ctrl.getStats);

module.exports = router;
