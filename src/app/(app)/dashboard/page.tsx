"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, AreaChart, Area, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Banknote, CalendarCheck, TrendingUp, TrendingDown } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const monthlySalaryData = [
  { month: "Jan", total: 350000 },
  { month: "Feb", total: 380000 },
  { month: "Mar", total: 420000 },
  { month: "Apr", total: 410000 },
  { month: "May", total: 450000 },
  { month: "Jun", total: 430000 },
];

const attendanceData = [
    { date: "2024-07-01", rate: 95.2 },
    { date: "2024-07-02", rate: 96.1 },
    { date: "2024-07-03", rate: 94.8 },
    { date: "2024-07-04", rate: 97.0 },
    { date: "2024-07-05", rate: 93.5 },
    { date: "2024-07-06", rate: 92.1 },
    { date: "2024-07-07", rate: 96.5 },
]

const chartConfig: ChartConfig = {
  total: {
    label: 'Salary',
    color: 'hsl(var(--primary))',
  },
};

const attendanceChartConfig: ChartConfig = {
    rate: {
        label: 'Attendance Rate',
        color: 'hsl(var(--primary))',
    }
}

const sliderImages = PlaceHolderImages.filter(img => img.id.startsWith('hero-slider-'));

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="w-full">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {sliderImages.map((image) => (
              <CarouselItem key={image.id}>
                <div className="relative h-64 md:h-96 w-full">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover rounded-lg"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </Carousel>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">152</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" /> +5 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary Cost</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BDT 430,000</div>
            <p className="text-xs text-muted-foreground flex items-center">
                <TrendingDown className="mr-1 h-3 w-3 text-destructive" /> -4.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.1%</div>
            <p className="text-xs text-muted-foreground">146 of 152 workers present</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Salary Overview</CardTitle>
            <CardDescription>Total salary disbursed over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalaryData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `BDT ${Number(value) / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.5 }}
                  content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                          return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                          <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                                          <span className="font-bold text-muted-foreground">{payload[0].payload.month}</span>
                                      </div>
                                      <div className="flex flex-col">
                                          <span className="text-[0.70rem] uppercase text-muted-foreground">Salary</span>
                                          <span className="font-bold">
                                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(payload[0].value as number)}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                          )
                      }
                      return null
                  }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance Rate</CardTitle>
            <CardDescription>Attendance percentage over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={attendanceData}>
                    <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: 'numeric', month: 'short'})}
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                        domain={[90, 100]} 
                        tickFormatter={(value) => `${value}%`}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                                                <span className="font-bold text-muted-foreground">{new Date(payload[0].payload.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">Rate</span>
                                                <span className="font-bold">{(payload[0].value as number).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            return null;
                        }}
                    />
                    <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}