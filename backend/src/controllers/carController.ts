import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { carService } from '../services/carService';
import { ApiResponse } from '../utils/ApiResponse';

export const getCars = catchAsync(async (req: Request, res: Response) => {
  const result = await carService.getAllCars(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Cars retrieved'));
});

export const getCarById = catchAsync(async (req: Request, res: Response) => {
  const car = await carService.getCarById(req.params.id as string);
  res.status(200).json(new ApiResponse(200, car, 'Car retrieved'));
});

export const createCar = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const imageUrls = files ? files.map(file => file.path) : [];

  if (typeof req.body.location === 'string') {
    req.body.location = JSON.parse(req.body.location);
  }

  const newCar = await carService.createCar(req.body, imageUrls);
  res.status(201).json(new ApiResponse(201, newCar, 'Car added successfully'));
});

export const updateCar = catchAsync(async (req: Request, res: Response) => {
  const updatedCar = await carService.updateCar(req.params.id as string, req.body);
  res.status(200).json(new ApiResponse(200, updatedCar, 'Car updated'));
});

export const deleteCar = catchAsync(async (req: Request, res: Response) => {
  await carService.deleteCar(req.params.id as string);
  res.status(200).json(new ApiResponse(200, null, 'Car retired successfully'));
});
