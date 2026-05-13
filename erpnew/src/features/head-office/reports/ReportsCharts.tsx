"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import ReportChartCard from "./ReportChartCard";
import ReportChartTooltip from "./ReportChartTooltip";
import type { ChartRow } from "./types";
import {
  ERP_CHART,
  formatCurrency,
  METAL_COLORS,
  PIE_COLORS,
} from "./report-utils";

type Props = {
  monthlyTrend: ChartRow[];
  categorySales: ChartRow[];
  metalDistribution: ChartRow[];
  dailyTrend: ChartRow[];
};

const AXIS_TICK = {
  fontSize: 12,
  fill: "var(--color-erp-muted)",
};

const GRID_STROKE = "var(--color-erp-border)";

function EmptyChart({ message = "No chart data found." }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center text-[14px] font-medium text-erp-muted">
      {message}
    </div>
  );
}

function MonthlySalesProfitChart({ data }: { data: ChartRow[] }) {
  if (!data.length) return <EmptyChart message="No monthly trend found." />;

  const hasProfit = data.some(
    (item) => typeof item.profit === "number" && Number.isFinite(item.profit)
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{
          top: 18,
          right: 16,
          left: 0,
          bottom: 8,
        }}
      >
        <defs>
          <linearGradient
            id="erpMonthlySalesGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={ERP_CHART.primary} stopOpacity={0.26} />
            <stop offset="45%" stopColor={ERP_CHART.primary} stopOpacity={0.14} />
            <stop offset="100%" stopColor={ERP_CHART.primary} stopOpacity={0.02} />
          </linearGradient>

          <linearGradient
            id="erpMonthlyProfitGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.24} />
            <stop offset="48%" stopColor="#06B6D4" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke={GRID_STROKE}
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          dy={10}
          interval={0}
          minTickGap={8}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          tickFormatter={(value) => formatCurrency(value)}
          width={62}
        />

        <Tooltip content={<ReportChartTooltip />} />

        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          wrapperStyle={{
            fontSize: 13,
            color: "var(--color-erp-text-soft)",
            paddingTop: 12,
          }}
        />

        <Area
          type="monotone"
          dataKey="sales"
          name="Sales"
          stroke="none"
          fill="url(#erpMonthlySalesGradient)"
          fillOpacity={1}
          isAnimationActive={false}
        />

        {hasProfit ? (
          <Area
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="none"
            fill="url(#erpMonthlyProfitGradient)"
            fillOpacity={1}
            isAnimationActive={false}
          />
        ) : null}

        <Line
          type="monotone"
          dataKey="sales"
          name="Sales"
          stroke={ERP_CHART.primary}
          strokeWidth={3.2}
          dot={false}
          activeDot={{
            r: 5,
            strokeWidth: 2,
            stroke: ERP_CHART.primary,
            fill: ERP_CHART.card,
          }}
          isAnimationActive={false}
        />

        {hasProfit ? (
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#06B6D4"
            strokeWidth={3.2}
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              stroke: "#06B6D4",
              fill: ERP_CHART.card,
            }}
            isAnimationActive={false}
          />
        ) : null}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function CategoryPieChart({ data }: { data: ChartRow[] }) {
  if (!data.length) return <EmptyChart message="No category sales found." />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius="72%"
          innerRadius={0}
          paddingAngle={1}
          label={({ name, percent }) =>
            `${name} ${((percent || 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
          fontSize={12}
        >
          {data.map((_, index) => (
            <Cell
              key={`category-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip content={<ReportChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function MetalBarChart({ data }: { data: ChartRow[] }) {
  if (!data.length) return <EmptyChart message="No metal distribution found." />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 4, bottom: 8 }}
      >
        <CartesianGrid
          stroke={GRID_STROKE}
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          dy={10}
          interval={0}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          tickFormatter={(value) => formatCurrency(value)}
          width={58}
        />

        <Tooltip content={<ReportChartTooltip />} />

        <Legend
          verticalAlign="bottom"
          iconType="square"
          wrapperStyle={{
            fontSize: 13,
            color: "var(--color-erp-text-soft)",
            paddingTop: 12,
          }}
        />

        <Bar
          dataKey="value"
          name="Revenue"
          radius={[8, 8, 0, 0]}
          barSize={52}
        >
          {data.map((_, index) => (
            <Cell
              key={`metal-${index}`}
              fill={METAL_COLORS[index % METAL_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DailyTrendLineChart({ data }: { data: ChartRow[] }) {
  if (!data.length) return <EmptyChart message="No daily trend found." />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 16, left: 4, bottom: 8 }}
      >
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          dy={10}
          interval="preserveStartEnd"
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          tickFormatter={(value) => formatCurrency(value)}
          width={58}
        />

        <Tooltip content={<ReportChartTooltip />} />

        <Line
          type="monotone"
          dataKey="sales"
          name="Sales"
          stroke={ERP_CHART.success}
          strokeWidth={3}
          dot={{
            r: 4,
            strokeWidth: 2,
            fill: ERP_CHART.success,
            stroke: ERP_CHART.success,
          }}
          activeDot={{ r: 6 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function ReportsCharts({
  monthlyTrend,
  categorySales,
  metalDistribution,
  dailyTrend,
}: Props) {
  return (
    <div className="space-y-5">
      <ReportChartCard
        title="Monthly Sales & Profit Trend"
        subtitle="Monthly sales and profitability analysis"
        icon={<LineChartIcon className="h-5 w-5" />}
        iconClassName="text-erp-purple"
        headerClassName="bg-erp-purple-soft"
        heightClassName="h-[320px] sm:h-[390px] xl:h-[430px]"
      >
        <MonthlySalesProfitChart data={monthlyTrend} />
      </ReportChartCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ReportChartCard
          title="Category-wise Sales"
          subtitle="Revenue distribution by product category"
          icon={<PieChartIcon className="h-5 w-5" />}
          iconClassName="text-erp-primary"
          headerClassName="bg-erp-primary-soft"
          heightClassName="h-[320px] sm:h-[380px] xl:h-[410px]"
        >
          <CategoryPieChart data={categorySales} />
        </ReportChartCard>

        <ReportChartCard
          title="Metal Type Distribution"
          subtitle="Sales breakdown by metal purity"
          icon={<BarChart3 className="h-5 w-5" />}
          iconClassName="text-erp-warning"
          headerClassName="bg-erp-yellow-soft"
          heightClassName="h-[320px] sm:h-[380px] xl:h-[410px]"
        >
          <MetalBarChart data={metalDistribution} />
        </ReportChartCard>
      </div>

      <ReportChartCard
        title="Daily Sales Trend (Last 30 Days)"
        subtitle="Day-by-day sales performance tracking"
        icon={<TrendingUp className="h-5 w-5" />}
        iconClassName="text-erp-success"
        headerClassName="bg-erp-success-soft"
        heightClassName="h-[320px] sm:h-[390px] xl:h-[430px]"
      >
        <DailyTrendLineChart data={dailyTrend} />
      </ReportChartCard>
    </div>
  );
}