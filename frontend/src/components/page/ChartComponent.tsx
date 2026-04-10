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
import { cn } from "@/utils/lib/utils";

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

const views: { key: ChartView; label: string }[] = [
  { key: "last7Days", label: "7 Days" },
  { key: "currentMonth", label: "Month" },
  { key: "allTimebyMonth", label: "By Month" },
  { key: "allTimebyDay", label: "By Day" },
  { key: "rollingEatingOutPercentage", label: "Rolling %" },
];

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
    <div className="flex flex-col gap-4">
      {/* Tab-style view switcher */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {views.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setChartView(key)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              chartView === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lookback input for rolling % */}
      {chartView === "rollingEatingOutPercentage" && (
        <div className="flex items-center gap-2">
          <label htmlFor="lookbackPeriod" className="text-xs text-muted-foreground whitespace-nowrap">
            Lookback:
          </label>
          <Input
            id="lookbackPeriod"
            type="number"
            min="0"
            max="365"
            value={lookbackPeriod}
            onChange={(e) =>
              setLookbackPeriod(Math.max(0, parseInt(e.target.value) || 0))
            }
            className="w-20 h-7 text-xs text-center"
          />
          <span className="text-xs text-muted-foreground">days</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setLookbackPeriod(0)}
          >
            All Time
          </Button>
        </div>
      )}

      {/* Chart */}
      <div className="h-[280px] sm:h-[320px] w-full">
        <ChartContainer config={chartConfig} className="w-full h-full">
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
                    value: "Percentage",
                    style: { textAnchor: "middle" },
                    angle: -90,
                    position: "left",
                    offset: 0,
                  }}
                  tick={{ fontSize: 10 }}
                  width={45}
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 border rounded bg-popover text-popover-foreground text-xs shadow-md">
                          <p className="font-semibold mb-1">{label}</p>
                          <p>
                            Eating Out:{" "}
                            {typeof payload[0]?.value === "number"
                              ? payload[0].value.toFixed(1)
                              : "0"}
                            %
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <CartesianGrid vertical={false} strokeOpacity={0.3} />
                <Line
                  dataKey="eatenOutPercentage"
                  stroke="#f9a8d4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Eating Out %"
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
                <YAxis tick={{ fontSize: 10 }} width={28} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) =>
                        `# of ${
                          label === "eatenOut" ? "Eaten Out" : "Eaten"
                        } Meals`
                      }
                    />
                  }
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <CartesianGrid vertical={false} strokeOpacity={0.3} />
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
    </div>
  );
};

export default ChartComponent;
export type { ChartView };
