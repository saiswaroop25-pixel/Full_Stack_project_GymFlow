const router = require('express').Router();
const ctrl   = require('../controllers/crowdController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/current',             protect,              ctrl.getCurrent);
router.get('/hourly',              protect,              ctrl.getHourly);
router.get('/weekly',              protect,              ctrl.getWeekly);
router.post('/checkin',            protect,              ctrl.checkIn);
router.post('/checkout',           protect,              ctrl.checkOut);
router.post('/override',           protect, adminOnly,   ctrl.overrideCrowd);
router.post('/broadcast',          protect, adminOnly,   ctrl.broadcast);

module.exports = router;
