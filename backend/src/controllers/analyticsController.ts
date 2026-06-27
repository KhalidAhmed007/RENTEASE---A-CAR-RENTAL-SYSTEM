import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { analyticsService } from '../services/analyticsService';
import { ApiResponse } from '../utils/ApiResponse';

export const getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  const kpis = await analyticsService.getDashboardKPIs();
  res.status(200).json(new ApiResponse(200, kpis, 'Dashboard KPIs retrieved successfully'));
});

export const getRevenueChart = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year ? parseInt(req.query.year as string) : undefined;
  const chartData = await analyticsService.getMonthlyRevenueChart(year);
  res.status(200).json(new ApiResponse(200, chartData, 'Revenue chart data retrieved'));
});

export const getCarUtilization = catchAsync(async (req: Request, res: Response) => {
  const utilization = await analyticsService.getCarUtilization();
  res.status(200).json(new ApiResponse(200, utilization, 'Car utilization retrieved'));
});
