import React from "react";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto pt-8 flex gap-4 items-center justify-center w-full border-t dark:border-gray-800 border-gray-200">
      <a
        className="flex items-center gap-2 py-4"
        href="https://www.adamsulemanji.com"
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
        <p className="underline-offset-3 group relative inline-block underline underline-offset-2 decoration-gray-200">
          Made by Adam Sulemanji
          <span className="absolute bottom-0 left-0 mt-1 block h-[2px] w-0 bg-current transition-all duration-300 group-hover:w-full"></span>
        </p>
      </a>
    </footer>
  );
};

export default Footer; 