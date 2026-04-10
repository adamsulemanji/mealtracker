import React from "react";

interface GreetingHeaderProps {
  phrase: string;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ phrase }) => {
  return (
    <div className="min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold leading-[1.1] tracking-tighter">
        Hi Nikki
      </h1>
      <p className="text-xs text-muted-foreground/70 hidden sm:block truncate max-w-xs mt-0.5">
        {phrase}
      </p>
    </div>
  );
};

export default GreetingHeader;
