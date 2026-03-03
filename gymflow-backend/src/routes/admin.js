const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard',               ctrl.getDashboard);

// Members
router.get('/members',                 ctrl.getMembers);
router.get('/members/:id',             ctrl.getMember);
router.patch('/members/:id',           ctrl.updateMember);
router.delete('/members/:id',          ctrl.deleteMember);

// Equipment
router.get('/equipment',               ctrl.getEquipment);
router.patch('/equipment/:id',         ctrl.updateEquipment);

// Analytics
router.get('/analytics',               ctrl.getAnalytics);

// Announcements
router.get('/announcements',           ctrl.getAnnouncements);
router.post('/announcements',          ctrl.createAnnouncement);
router.delete('/announcements/:id',    ctrl.deleteAnnouncement);

// AI Insights
router.get('/ai-insights',             ctrl.getAIInsights);

module.exports = router;
