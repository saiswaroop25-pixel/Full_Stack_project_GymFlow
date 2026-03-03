const router = require('express').Router();
const ctrl   = require('../controllers/dietController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/meals',       ctrl.getMeals);
router.get('/meals/:id',   ctrl.getMeal);
router.post('/meals',      ctrl.createMeal);
router.patch('/meals/:id', ctrl.updateMeal);
router.delete('/meals/:id',ctrl.deleteMeal);
router.get('/summary',     ctrl.getSummary);
router.get('/goals',       ctrl.getMacroGoals);

module.exports = router;
