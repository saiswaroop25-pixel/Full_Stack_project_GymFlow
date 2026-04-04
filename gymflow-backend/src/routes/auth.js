const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');
const GOALS = ['MUSCLE_GAIN', 'FAT_LOSS', 'ENDURANCE', 'GENERAL_FITNESS', 'STRENGTH'];

// POST /api/auth/register
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 80 }).withMessage('Name is too long.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('goal').optional().isIn(GOALS).withMessage('Invalid fitness goal.'),
    body('height').optional({ values: 'falsy' }).isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300 cm.'),
    body('weight').optional({ values: 'falsy' }).isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg.'),
  ],
  validate,
  ctrl.register
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  ctrl.login
);

// GET  /api/auth/me
router.get('/me', protect, ctrl.getMe);
router.get('/me/pass', protect, ctrl.getCheckInPass);

// PATCH /api/auth/profile
router.patch('/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.').isLength({ max: 80 }).withMessage('Name is too long.'),
    body('goal').optional().isIn(GOALS).withMessage('Invalid fitness goal.'),
    body('height').optional({ values: 'falsy' }).isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300 cm.'),
    body('weight').optional({ values: 'falsy' }).isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg.'),
    body('targetWeight').optional({ values: 'falsy' }).isFloat({ min: 20, max: 500 }).withMessage('Target weight must be between 20 and 500 kg.'),
    body('bodyFat').optional({ values: 'falsy' }).isFloat({ min: 1, max: 100 }).withMessage('Body fat must be between 1 and 100 percent.'),
    body('phone').optional({ values: 'falsy' }).isLength({ max: 25 }).withMessage('Phone number is too long.'),
  ],
  validate,
  ctrl.updateProfile
);

// PATCH /api/auth/password
router.patch('/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
    body('newPassword').custom((value, { req }) => value !== req.body.currentPassword).withMessage('New password must be different from the current password.'),
  ],
  validate,
  ctrl.changePassword
);

module.exports = router;
