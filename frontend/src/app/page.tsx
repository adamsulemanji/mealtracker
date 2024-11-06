"use client"

import Image from "next/image";
import React from "react";
import axios from "axios";

import { useState } from "react";
import { DatePickerDemo } from "@/components/DatePicker";
import { NewMeal } from "@/components/NewMeal";
import { useToast } from "@/hooks/use-toast";


import { Button } from "@/components/ui/button";


export default function Home() {

  const [date, setDate] = useState<Date>();
  const [newMeal, setNewMeal] = useState(false);
  const { toast } = useToast();

  const handleDateChange = (date: Date) => {
    console.log("Date selected from page.tsx:", date);
    setDate(date);
  };

  const deleteAllMeals = () => {
    axios.delete("https://localhost:3000/meals").then((response) => {
      console.log(response);
    });
    toast({
      title: "Deleted all meals",
      description: "You have successfully deleted all meals",
    })
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
          Welcome to Nikki to your Meal Tracker!
        </h1>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          < NewMeal />
          <Button onClick={deleteAllMeals}>Delete All Meals</Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
