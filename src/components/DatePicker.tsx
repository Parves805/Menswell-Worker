'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { SelectSingleEventHandler } from 'react-day-picker';
import { isValid } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    name?: string;
    value?: Date;
    onSelect?: SelectSingleEventHandler;
}

export function DatePicker({ name, value, onSelect }: DatePickerProps) {
  const [date, setDate] = React.useState<Date|undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect: SelectSingleEventHandler = (day, selectedDay, activeModifiers, e) => {
      setDate(selectedDay);
      if (onSelect) {
          onSelect(day, selectedDay, activeModifiers, e);
      }
  }

  const isValidDate = (d: any): d is Date => d instanceof Date && isValid(d);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isValidDate(date) ? format(date, 'PPP', { locale: bn }) : <span>একটি তারিখ নির্বাচন করুন</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={bn}
        />
      </PopoverContent>
      {/* Hidden input to hold the date value for form submission */}
      {isValidDate(date) && <input type="hidden" name={name} value={date.toISOString()} />}
    </Popover>
  );
}
