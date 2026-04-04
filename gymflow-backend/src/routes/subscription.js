const router = require('express').Router();
const ctrl = require('../controllers/subscriptionController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/plans', ctrl.getPlans);
router.get('/me', ctrl.getMySubscription);
router.post('/checkout', ctrl.checkoutValidators, validate, ctrl.checkout);
router.post('/cancel', ctrl.cancel);
router.get('/payments', adminOnly, ctrl.getPayments);

module.exports = router;
