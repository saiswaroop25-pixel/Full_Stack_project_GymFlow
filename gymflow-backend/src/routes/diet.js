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
router.get('/food/search', ctrl.searchFoods);
router.get('/saved-meals', ctrl.getSavedMeals);
router.post('/saved-meals', ctrl.createSavedMeal);
router.delete('/saved-meals/:id', ctrl.deleteSavedMeal);
router.get('/plan', ctrl.getMealPlan);
router.post('/plan', ctrl.saveMealPlan);

module.exports = router;
