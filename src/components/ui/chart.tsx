"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const CartesianGrid = React.forwardRef<
  SVGRectElement,
  React.ComponentProps<typeof RechartsPrimitive.CartesianGrid>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.CartesianGrid
    ref={ref}
    className={cn("stroke-border stroke-1", className)}
    {...props}
  />
))

CartesianGrid.displayName = "CartesianGrid"

interface ChartTooltipProps {
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
  className?: string;
  active?: boolean;
  payload?: any[];
}

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  ChartTooltipProps
>(({ active, payload, className, indicator = "dot", hideIndicator = false, ...props }, ref) => {
  if (active && payload && payload.length) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background px-3 py-2 text-sm shadow-md",
          className
        )}
        {...props}
      >
        {payload.map((item: any) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-x-4"
          >
            {item.name && (
              <span className="flex items-center gap-x-2" data-testid="chart-tooltip-item-name">
                {!hideIndicator && (
                  <span
                    className={cn("flex h-2 w-2 rounded-full", item.color)}
                    style={{ backgroundColor: item.color }}
                  />
                )}
                {item.name}
              </span>
            )}
            <span className="text-right font-medium" data-testid="chart-tooltip-item-value">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
})
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps {
  nameKey?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
  active?: boolean;
  payload?: any[];
  className?: string;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ className, payload, nameKey, hideLabel = false, hideIndicator = false, indicator = "dot", active, ...props }, ref) => {
  if (!(active && payload && payload.length)) return null

  const data = payload.map((item: any) => ({
    color: item.color || item.payload.fill,
    value: item.value,
    name: item.name || item.dataKey,
    payload: item.payload,
  }))

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background px-3 py-2 text-sm shadow-md",
        className
      )}
      {...props}
    >
      {!hideLabel && (
        <div className="text-muted-foreground text-sm mb-1">
          {payload[0].payload[nameKey || payload[0].dataKey || '']}
        </div>
      )}
      <div className="grid gap-1.5">
        {data.map((item: any, index: number) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}-${index}`
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-x-4"
            >
              <span className="flex items-center gap-x-2" data-testid="chart-tooltip-item-name">
                {!hideIndicator && (
                  <span
                    className={cn("flex h-2 w-2 rounded-full", item.color)}
                    style={{ backgroundColor: item.color }}
                  />
                )}
                {item.name}
              </span>
              <span className="text-right font-medium" data-testid="chart-tooltip-item-value">
                {item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
  };
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactElement
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId}`

  return (
    <div
      ref={ref}
      data-chart={chartId}
      className={cn(
        "flex aspect-video justify-center text-foreground",
        className
      )}
      {...props}
    >
      <ChartContext.Provider value={{ config }}>
        {React.cloneElement(children, {
          id: chartId,
          className: cn("max-h-[--container-height] w-full", children.props?.className),
        })}
      </ChartContext.Provider>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

export {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
  CartesianGrid,
}

export type { ChartConfig }