'use client';

import { LabelList, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

type ServiceCategoryStat = {
  category: string;
  label: string;
  count: number;
  fill: string;
};

const chartConfig = {
  count: {
    label: 'Services'
  }
} satisfies ChartConfig;

export function PieGraph({ data }: { data: ServiceCategoryStat[] }) {
  const totalServices = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>
          Service Mix
          <Badge variant='outline'>
            <Icons.trendingUp />
            {totalServices}
          </Badge>
        </CardTitle>
        <CardDescription>Active services by category</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px] min-h-[250px]'
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey='label' hideLabel />} />
            <Pie
              data={data}
              innerRadius={30}
              dataKey='count'
              nameKey='label'
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey='count'
                stroke='none'
                fontSize={12}
                fontWeight={500}
                fill='currentColor'
                formatter={(value: number) => value.toString()}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
