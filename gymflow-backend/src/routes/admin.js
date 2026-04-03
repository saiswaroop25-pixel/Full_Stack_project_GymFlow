const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const PLAN_TYPES = ['BASIC', 'PREMIUM', 'STUDENT', 'ANNUAL'];
const USER_ROLES = ['USER', 'ADMIN'];
const EQUIPMENT_STATUSES = ['OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE'];
const ANNOUNCEMENT_TYPES = ['alert', 'offer', 'update', 'maintenance'];

router.use(protect, adminOnly);

router.get('/dashboard', ctrl.getDashboard);

router.get('/members', ctrl.getMembers);
router.get('/members/:id', ctrl.getMember);
router.patch(
  '/members/:id',
  [
    body('plan').optional().isIn(PLAN_TYPES).withMessage('Invalid membership plan.'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true or false.'),
    body('role').optional().isIn(USER_ROLES).withMessage('Invalid user role.'),
  ],
  validate,
  ctrl.updateMember
);
router.delete('/members/:id', ctrl.deleteMember);

router.get('/equipment', ctrl.getEquipment);
router.patch(
  '/equipment/:id',
  [
    body('status').optional().isIn(EQUIPMENT_STATUSES).withMessage('Invalid equipment status.'),
    body('usageRate').optional({ values: 'falsy' }).isInt({ min: 0, max: 100 }).withMessage('Usage rate must be between 0 and 100.'),
    body('notes').optional({ values: 'falsy' }).isLength({ max: 500 }).withMessage('Equipment notes are too long.'),
    body('nextMaintDate').optional({ values: 'falsy' }).isISO8601().withMessage('Next maintenance date must be valid.'),
  ],
  validate,
  ctrl.updateEquipment
);

router.get('/analytics', ctrl.getAnalytics);

router.get('/announcements', ctrl.getAnnouncements);
router.post(
  '/announcements',
  [
    body('title').trim().notEmpty().withMessage('Announcement title is required.').isLength({ max: 120 }).withMessage('Announcement title is too long.'),
    body('message').trim().notEmpty().withMessage('Announcement message is required.').isLength({ max: 500 }).withMessage('Announcement message is too long.'),
    body('type').optional().isIn(ANNOUNCEMENT_TYPES).withMessage('Invalid announcement type.'),
    body('audience').optional({ values: 'falsy' }).isLength({ max: 80 }).withMessage('Audience label is too long.'),
  ],
  validate,
  ctrl.createAnnouncement
);
router.delete('/announcements/:id', ctrl.deleteAnnouncement);

router.get('/ai-insights', ctrl.getAIInsights);

module.exports = router;
