"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/utils/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerDemoProps {
	onDateChange?: (date: Date) => void;
	selectedDate?: Date; // Add selectedDate prop
}

export function DatePickerDemo({ onDateChange, selectedDate }: DatePickerDemoProps) {
	const [date, setDate] = React.useState<Date | undefined>(selectedDate); // Initialize with selectedDate

	const handleDateSelect = (selectedDate: Date) => {
		setDate(selectedDate);
		if (onDateChange) {
			onDateChange(selectedDate);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-[280px] justify-start text-left font-normal",
						!date && "text-muted-foreground",
						
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(selectedDate) =>
						selectedDate && handleDateSelect(selectedDate)
					}
				/>
			</PopoverContent>
		</Popover>
	);
}
