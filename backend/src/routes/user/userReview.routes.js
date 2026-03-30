import express from 'express';
import { submitReview, getExistingReview, getRestaurantReviews } from '../../controllers/user/userReview.controller.js';
import { verifyRole } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { reviewSchema } from '../../validators/review.validator.js';
import ROLES from '../../constants/roles.js';

const router = express.Router();

router.post('/reviews/submit', verifyRole(ROLES.USER), validate(reviewSchema), submitReview);
router.get('/reviews/:restaurantId', verifyRole(ROLES.USER), getExistingReview);
router.get('/reviews/:id/all', getRestaurantReviews);

export default router;
