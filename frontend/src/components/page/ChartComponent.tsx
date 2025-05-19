import React from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ChartConfig } from "@/components/ui/chart";

type ChartView =
  | "last7Days"
  | "currentMonth"
  | "allTimebyMonth"
  | "allTimebyDay"
  | "rollingEatingOutPercentage";

interface ChartComponentProps {
  chartData: any[];
  chartTitle: string;
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
  lookbackPeriod: number;
  setLookbackPeriod: (period: number) => void;
  chartConfig: ChartConfig;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  chartData,
  chartTitle,
  chartView,
  setChartView,
  lookbackPeriod,
  setLookbackPeriod,
  chartConfig,
}) => {
  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">
        {chartTitle}
      </h2>
      
      {/* Lookback Period Input - show only for rolling percentage */}
      {chartView === "rollingEatingOutPercentage" && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <label htmlFor="lookbackPeriod" className="text-sm">
            Lookback Period:
          </label>
          <div className="flex items-center gap-1">
            <Input
              id="lookbackPeriod"
              type="number"
              min="0"
              max="365"
              value={lookbackPeriod}
              onChange={(e) => setLookbackPeriod(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-20 h-8 text-center"
            />
            <span className="text-sm">days</span>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-2 ml-1"
              onClick={() => setLookbackPeriod(0)}
            >
              All Time
            </Button>
          </div>
        </div>
      )}
      
      <div className="h-[300px] sm:h-[350px] w-full px-2">
        <ChartContainer
          config={chartConfig}
          className="w-full h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "rollingEatingOutPercentage" ? (
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickMargin={5}
                />
                <YAxis
                  label={{
                    value: `Percentage`,
                    style: { textAnchor: "middle" },
                    angle: -90,
                    position: "left",
                    offset: 0,
                  }}
                  tick={{ fontSize: 10 }}
                  width={45}
                />
                <ChartTooltip
                  content={({
                    active,
                    payload,
                    label,
                  }) => {
                    if (
                      active &&
                      payload &&
                      payload.length
                    ) {
                      return (
                        <div className="p-2 border rounded bg-white dark:bg-[#1B1D17]">
                          <p className="font-bold m-0">{label}</p>
                          <p className="m-0">
                            Eating Out Percentage:{" "}
                            {typeof payload[0]?.value === "number"
                              ? payload[0]?.value.toFixed(2)
                              : "0"}
                            %
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                <Legend />
                <CartesianGrid vertical={false} />
                <Line
                  dataKey="eatenOutPercentage"
                  stroke="#f9a8d4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  name="Eating Out Percentage"
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickMargin={5}
                />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) =>
                        `# of ${
                          label === "eatenOut"
                            ? "Eaten Out Meals"
                            : "Eaten Meals"
                        }`
                      }
                    />
                  }
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <CartesianGrid vertical={false} />
                <Bar
                  dataKey="eatenOut"
                  stackId="a"
                  fill="#fbcfe8"
                  radius={[4, 4, 0, 0]}
                  name="Eaten Out"
                />
                <Bar
                  dataKey="notEatenOut"
                  stackId="a"
                  fill="#f9a8d4"
                  radius={[4, 4, 0, 0]}
                  name="Eaten In"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      {/* Chart Buttons */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full mt-4">
        <Button
          size="sm"
          variant={chartView === "last7Days" ? "default" : "outline"}
          className="text-xs sm:text-sm"
          onClick={() => setChartView("last7Days")}
        >
          Last 7 Days
        </Button>
        <Button
          size="sm"
          variant={chartView === "currentMonth" ? "default" : "outline"}
          className="text-xs sm:text-sm"
          onClick={() => setChartView("currentMonth")}
        >
          Current Month
        </Button>
        <Button
          size="sm"
          variant={chartView === "allTimebyMonth" ? "default" : "outline"}
          className="text-xs sm:text-sm"
          onClick={() => setChartView("allTimebyMonth")}
        >
          All Time by Month
        </Button>
        <Button
          size="sm"
          variant={chartView === "allTimebyDay" ? "default" : "outline"}
          className="text-xs sm:text-sm"
          onClick={() => setChartView("allTimebyDay")}
        >
          All Time by Day
        </Button>
        <Button
          size="sm"
          variant={chartView === "rollingEatingOutPercentage" ? "default" : "outline"}
          className="text-xs sm:text-sm col-span-2 sm:col-span-1"
          onClick={() =>
            setChartView("rollingEatingOutPercentage")
          }
        >
          Rolling %
        </Button>
      </div>
    </div>
  );
};

export default ChartComponent;
export type { ChartView }; 