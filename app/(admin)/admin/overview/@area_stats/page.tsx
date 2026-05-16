import { AreaGraph } from '@/features/overview/components/area-graph';
import { getMonthlyBookingStats } from '@/features/overview/data';

export default async function AreaStats() {
  const data = await getMonthlyBookingStats();
  return <AreaGraph data={data} />;
}
