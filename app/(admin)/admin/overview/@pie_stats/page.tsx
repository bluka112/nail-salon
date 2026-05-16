import { PieGraph } from '@/features/overview/components/pie-graph';
import { getServiceCategoryStats } from '@/features/overview/data';

export default async function Stats() {
  const data = await getServiceCategoryStats();
  return <PieGraph data={data} />;
}
