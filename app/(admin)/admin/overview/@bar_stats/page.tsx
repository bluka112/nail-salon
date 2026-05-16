import { BarGraph } from '@/features/overview/components/bar-graph';
import { getMonthlyBookingStats } from '@/features/overview/data';

export default async function BarStats() {
  const data = await getMonthlyBookingStats();
  return <BarGraph data={data} />;
}
