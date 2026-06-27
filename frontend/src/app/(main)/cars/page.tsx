import { CarBrowser } from '@/components/cars/CarBrowser';

export const metadata = {
  title: 'Browse Cars | Car Rental System',
  description: 'Search and filter our wide selection of vehicles. Book the perfect car for your trip.',
};

export default function CarsPage() {
  return <CarBrowser />;
}
