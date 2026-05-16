import { RecentSales } from '@/features/overview/components/recent-sales';
import { getRecentBookings } from '@/features/overview/data';

export default async function Sales() {
  const bookings = await getRecentBookings();
  return <RecentSales bookings={bookings} />;
}
