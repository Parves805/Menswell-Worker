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

const chartData: any[] = [];

const chartConfig: ChartConfig = {
  tshirts: {
    label: 'টি-শার্ট',
    color: 'hsl(var(--chart-1))',
  },
  polos: {
    label: 'পোলো শার্ট',
    color: 'hsl(var(--chart-2))',
  },
  pants: {
    label: 'প্যান্ট',
    color: 'hsl(var(--chart-3))',
  },
};

export function ProductionChart() {
  return (
    <Card className="font-sans">
      <CardHeader>
        <CardTitle>উৎপাদন চিত্র</CardTitle>
        <CardDescription>গত ৭ দিনের উৎপাদনের সারসংক্ষেপ</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
            {chartData.length > 0 ? (
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
            ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <p>উৎপাদনের কোনো ডেটা পাওয়া যায়নি।</p>
                </div>
            )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
