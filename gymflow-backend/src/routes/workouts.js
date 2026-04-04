const router = require('express').Router();
const ctrl   = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

router.use(protect); // all workout routes require auth

router.get('/',                    ctrl.getLogs);
router.get('/templates',           ctrl.getTemplates);
router.post('/templates',          ctrl.createTemplate);
router.get('/templates/:id/use',   ctrl.useTemplate);
router.delete('/templates/:id',    ctrl.deleteTemplate);
router.get('/exercise-history',    ctrl.getExerciseHistory);
router.get('/analytics/summary',   ctrl.getAnalytics);
router.get('/:id',                 ctrl.getLog);
router.post('/',                   ctrl.createLog);
router.patch('/:id',               ctrl.updateLog);
router.delete('/:id',              ctrl.deleteLog);

module.exports = router;
