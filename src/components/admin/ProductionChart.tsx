'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const chartData = [
  { date: 'Jul 22', tshirts: 1250, polos: 800, pants: 450 },
  { date: 'Jul 23', tshirts: 1300, polos: 850, pants: 470 },
  { date: 'Jul 24', tshirts: 1100, polos: 780, pants: 420 },
  { date: 'Jul 25', tshirts: 1400, polos: 920, pants: 500 },
  { date: 'Jul 26', tshirts: 1350, polos: 880, pants: 480 },
  { date: 'Jul 27', tshirts: 1500, polos: 950, pants: 520 },
  { date: 'Jul 28', tshirts: 1450, polos: 900, pants: 490 },
];

const chartConfig: ChartConfig = {
  tshirts: {
    label: 'T-Shirts',
    color: 'hsl(var(--chart-1))',
  },
  polos: {
    label: 'Polo Shirts',
    color: 'hsl(var(--chart-2))',
  },
  pants: {
    label: 'Pants',
    color: 'hsl(var(--chart-3))',
  },
};

export function ProductionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Overview</CardTitle>
        <CardDescription>Last 7 days production summary</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              dataKey="tshirts"
              type="natural"
              stroke="var(--color-tshirts)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="polos"
              type="natural"
              stroke="var(--color-polos)"
              strokeWidth={2}
              dot={false}
            />
             <Line
              dataKey="pants"
              type="natural"
              stroke="var(--color-pants)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
