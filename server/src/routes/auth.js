import { Router } from 'express';
import { config } from '../config.js';
import { asyncHandler, ApiError } from '../lib/http.js';
import { issueToken, verifyToken } from '../lib/token.js';
import { readBearer } from '../lib/token.js';

const router = Router();

const isAuthorisedEmail = (email) => {
  const value = String(email || '').toLowerCase().trim();
  return config.auth.emails.includes(value) || value.endsWith('@pup.edu.ph');
};

/**
 * POST /api/auth/login
 * Sumatanggap alinman sa `{ passcode }` (portal.html) o `{ email, password }`.
 * -> { success, token, user, role, expiresIn }
 */
router.post(
  '/login',
  asyncHandler((req, res) => {
    const body = req.body ?? {};
    const passcode = typeof body.passcode === 'string' ? body.passcode : body.password;
    const email = typeof body.email === 'string' ? body.email : config.auth.emails[0];

    if (!passcode) {
      throw ApiError.badRequest('Kinakailangan ang passcode upang makapasok sa Tanggapan ng Patnugutan.');
    }

    const emailAllowed = body.email ? isAuthorisedEmail(email) : true;
    if (!emailAllowed) throw ApiError.unauthorized('Hindi kinakailangan ang email na ito para sa portal.');

    if (passcode !== config.auth.passcode) {
      throw ApiError.unauthorized('Mali ang passcode. Pakisuri muli.');
    }

    const user = {
      email,
      name: 'Tanggapan ng Patnugutan',
      role: 'editor-in-chief',
    };

    res.json({
      success: true,
      token: issueToken(user),
      user,
      role: user.role,
      expiresIn: config.auth.ttlSeconds,
      message: 'Maligayang pagdating sa Tanggapan ng Patnugutan, Ang Himaya.',
    });
  }),
);

/** GET /api/auth/session — i-validate ang kasalukuyang token. */
router.get(
  '/session',
  asyncHandler((req, res) => {
    const session = verifyToken(readBearer(req));
    if (!session) throw ApiError.unauthorized('Walang aktibong session.');
    res.json({ data: session });
  }),
);

export default router;