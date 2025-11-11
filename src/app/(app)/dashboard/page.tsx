'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, CircleDollarSign, Hourglass } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Dummy data for worker dashboard
const workerData = {
  name: 'আয়েশা খানম',
  designation: 'সুইং অপারেটর',
  todayProduction: 112, // pieces
  todayOvertime: 2, // hours
  pieceRate: 5.5, // BDT per piece
  overtimeRate: 50, // BDT per hour
  advanceBalance: 2500, // BDT
};

const todayEarnings =
  workerData.todayProduction * workerData.pieceRate +
  workerData.todayOvertime * workerData.overtimeRate;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

const sliderImages = PlaceHolderImages.filter(img => img.id.startsWith('hero-slider'));


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
       <Carousel
        opts={{
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {sliderImages.map((image) => (
            <CarouselItem key={image.id}>
              <Card className="overflow-hidden border-none">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/7] w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                     <div className="absolute inset-0 bg-black/40" />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
      </Carousel>
      
      <Card className="w-full bg-primary text-primary-foreground border-none">
        <CardHeader>
          <CardTitle>স্বাগতম, {workerData.name}!</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            আপনার আজকের কাজের সারসংক্ষেপ নিচে দেওয়া হলো।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">আজকের মোট আয়</p>
              <p className="text-3xl font-bold">
                {formatCurrency(todayEarnings)}
              </p>
            </div>
            <Link href="/entry">
              <Button variant="secondary">নতুন এন্ট্রি করুন</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের উৎপাদন</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerData.todayProduction} পিস</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের ওভারটাইম</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerData.todayOvertime} ঘণ্টা</div>
             <p className="text-xs text-muted-foreground">প্রতি ঘণ্টা রেট: {formatCurrency(workerData.overtimeRate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">বকেয়া অগ্রিম</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(workerData.advanceBalance)}
            </div>
            <p className="text-xs text-muted-foreground">পরবর্তী বেতন থেকে কর্তনযোগ্য</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
