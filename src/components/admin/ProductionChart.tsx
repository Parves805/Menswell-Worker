'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductionChartProps {
    data: { date: string, pieces: number }[];
}


export function ProductionChart({ data }: ProductionChartProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>সাপ্তাহিক উৎপাদন</CardTitle>
        </CardHeader>
      <CardContent>
        {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar dataKey="pieces" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        ) : (
            <div className="flex h-[350px] w-full items-center justify-center">
                <p className="text-muted-foreground">উৎপাদনের কোনো ডেটা নেই।</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
