import React from "react";

interface GreetingHeaderProps {
  phrase: string;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ phrase }) => {
  return (
    <div className="w-full text-center sm:text-left">
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold">
        Hi Nikki
      </h1>
      <h2 className="text-base sm:text-lg md:text-xl mt-2">
        Welcome to your meal tracker
      </h2>
      <p className="text-sm text-muted-foreground mt-2">{phrase}</p>
    </div>
  );
};

export default GreetingHeader; 