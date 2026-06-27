import { Router } from 'express';
import { getDashboardOverview, getRevenueChart, getCarUtilization } from '../../controllers/analyticsController';
import { protect, authorize } from '../../middlewares/authMiddleware';

const router = Router();

// Analytics are strictly Admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/kpis', getDashboardOverview);
router.get('/revenue-chart', getRevenueChart);
router.get('/utilization', getCarUtilization);

export default router;
