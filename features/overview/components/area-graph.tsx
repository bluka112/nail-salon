'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import React from 'react';

type MonthlyBookingStat = {
  month: string;
  bookings: number;
  revenue: number;
};

const chartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'var(--chart-1)'
  },
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export function AreaGraph({ data }: { data: MonthlyBookingStat[] }) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Revenue Trend
          <Badge variant='outline'>
            <Icons.trendingUp />
            ${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Badge>
        </CardTitle>
        <CardDescription>Completed booking revenue over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <DottedBackgroundPattern config={chartConfig} />
            </defs>
            <Area
              dataKey='revenue'
              type='natural'
              fill='url(#dotted-background-pattern-revenue)'
              fillOpacity={0.4}
              stroke='var(--color-revenue)'
              stackId='a'
              strokeWidth={0.8}
            />
            <Area
              dataKey='bookings'
              type='natural'
              fill='url(#dotted-background-pattern-bookings)'
              fillOpacity={0.4}
              stroke='var(--color-bookings)'
              stackId='a'
              strokeWidth={0.8}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.color])
  );
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          key={key}
          id={`dotted-background-pattern-${key}`}
          x='0'
          y='0'
          width='7'
          height='7'
          patternUnits='userSpaceOnUse'
        >
          <circle cx='5' cy='5' r='1.5' fill={value} opacity={0.5}></circle>
        </pattern>
      ))}
    </>
  );
};
