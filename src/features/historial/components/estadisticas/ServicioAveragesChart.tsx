'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart';
import type { ServicioAverageRow } from '@/shared/lib/historial-stats';

interface ServicioAveragesChartProps {
  data: ServicioAverageRow[];
}

/**
 * Sole module in this feature that imports `recharts`. Always loaded from
 * `ServicioAveragesCard` via `next/dynamic(..., { ssr: false })`, which never
 * statically imports this file or `recharts` itself -- keeping the historial
 * list route's chunk free of the charting library (spec Requirement 1).
 */
export function ServicioAveragesChart({ data }: ServicioAveragesChartProps) {
  // `row.servicio` is already the human label: historial records store the
  // servicio label, not the enum `value` (see the note in ServicioAveragesCard).
  const chartData = data.map((row, index) => ({
    ...row,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  // Single-series config only. Per-servicio entries were removed on purpose:
  // `ChartStyle` turns each config key into a `--color-<key>` custom property,
  // and real servicio names contain spaces and accents ("Oración y Enseñanza",
  // "Segundo servicio celebracion 13 años"), which are not valid custom
  // property names. The bar and tooltip swatch both take their colour from the
  // row's own `fill` via the payload, so nothing is lost.
  const chartConfig: ChartConfig = {
    averageTotal: { label: 'Promedio' },
  };

  return (
    // `h-full w-full` defers the height to the frame owned by
    // `ServicioAveragesCard`, which the dynamic-import skeleton also fills --
    // one responsive height, no layout shift when this module arrives.
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart
        data={chartData}
        margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="servicio"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={64}
          tickMargin={4}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={11}
          allowDecimals={false}
          width={40}
        />
        {/* No nameKey: the row resolves to the `averageTotal` config entry and
            reads "Promedio", while the tooltip header falls through to the
            x-axis category (the servicio label). The swatch colour comes from
            the hovered row's own `fill`. */}
        <ChartTooltip content={<ChartTooltipContent />} />
        {/* `maxBarSize` is the desktop guard: with only one or two servicios in
            range, an unconstrained bar spans hundreds of pixels on a wide
            monitor and stops reading as a bar at all. */}
        <Bar dataKey="averageTotal" radius={[4, 4, 0, 0]} maxBarSize={88}>
          {chartData.map((row) => (
            <Cell key={row.servicio} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
