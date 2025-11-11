'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { useToast } from '@/hooks/use-toast';

export default function EntryPage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const pieceCount = formData.get('piece-count');
    const overtime = formData.get('overtime');
    const date = formData.get('date');

    console.log({ date, pieceCount, overtime });

    toast({
      title: 'এন্ট্রি সফল হয়েছে',
      description: `আপনার ${pieceCount} পিস এবং ${overtime} ঘণ্টা ওভারটাইম এন্ট্রি সফলভাবে জমা হয়েছে।`,
    });
    
    event.currentTarget.reset();
  };

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>দৈনিক কাজের এন্ট্রি</CardTitle>
          <CardDescription>
            আজকের কাজের হিসাব জমা দিন। আপনার সুপারভাইজার এটি অনুমোদন করবেন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">তারিখ</Label>
              <DatePicker name="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piece-count"> মোট পিস সংখ্যা</Label>
              <Input
                id="piece-count"
                name="piece-count"
                type="number"
                placeholder="e.g., 120"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtime">ওভারটাইম (ঘণ্টা)</Label>
              <Input
                id="overtime"
                name="overtime"
                type="number"
                step="0.5"
                placeholder="e.g., 2.5"
                defaultValue="0"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              জমা দিন
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
