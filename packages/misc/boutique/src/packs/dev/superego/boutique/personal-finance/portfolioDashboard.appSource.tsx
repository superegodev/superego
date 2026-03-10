import React from "react";
import {
  Grid,
  Tile,
  Table,
  Text,
  Link,
  Echart,
  Select,
} from "@superego/app-sandbox/components";
import theme from "@superego/app-sandbox/theme";
import type {
  Security,
  PriceSnapshot,
} from "./ProtoCollection_1.js";
import type { Holding, Transaction } from "./ProtoCollection_2.js";
import type { Account } from "./ProtoCollection_3.js";
import type { EChartsOption } from "echarts";

interface Props {
  collections: {
    ProtoCollection_1: {
      id: "ProtoCollection_1";
      versionId: string;
      displayName: string;
      documents: {
        id: string;
        versionId: string;
        href: string;
        content: Security;
      }[];
    };
    ProtoCollection_2: {
      id: "ProtoCollection_2";
      versionId: string;
      displayName: string;
      documents: {
        id: string;
        versionId: string;
        href: string;
        content: Holding;
      }[];
    };
    ProtoCollection_3: {
      id: "ProtoCollection_3";
      versionId: string;
      displayName: string;
      documents: {
        id: string;
        versionId: string;
        href: string;
        content: Account;
      }[];
    };
  };
}

function getLatestPrice(security: Security): number | null {
  if (security.priceHistory.length === 0) return null;
  return security.priceHistory
    .slice()
    .sort((a, b) => a.instant.localeCompare(b.instant))
    .at(-1)!.price;
}

function computeNetQuantity(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => {
    return tx.type === "Buy" ? sum + tx.quantity : sum - tx.quantity;
  }, 0);
}

function computeAvgBuyCost(transactions: Transaction[]): number {
  const buys = transactions.filter((tx) => tx.type === "Buy");
  const totalQty = buys.reduce((s, tx) => s + tx.quantity, 0);
  if (totalQty === 0) return 0;
  const totalCost = buys.reduce(
    (s, tx) => s + tx.quantity * tx.pricePerUnit,
    0,
  );
  return totalCost / totalQty;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface HoldingRow {
  holdingId: string;
  holdingHref: string;
  securityName: string;
  ticker: string;
  currency: string;
  account: string;
  type: string;
  sector: string | null;
  netQty: number;
  avgCost: number;
  latestPrice: number | null;
  currentValue: number | null;
  gainLoss: number | null;
  gainLossPct: number | null;
}

function buildRows(props: Props): HoldingRow[] {
  const securities = props.collections.ProtoCollection_1.documents;
  const holdings = props.collections.ProtoCollection_2.documents;
  const accounts = props.collections.ProtoCollection_3.documents;

  return holdings.map((h) => {
    const sec = securities.find((s) => s.id === h.content.security.documentId);
    const acc = accounts.find((a) => a.id === h.content.account.documentId);
    const netQty = computeNetQuantity(h.content.transactions);
    const avgCost = computeAvgBuyCost(h.content.transactions);
    const latestPrice = sec ? getLatestPrice(sec.content) : null;
    const totalCost = netQty * avgCost;
    const currentValue = latestPrice !== null ? netQty * latestPrice : null;
    const gainLoss = currentValue !== null ? currentValue - totalCost : null;
    const gainLossPct =
      gainLoss !== null && totalCost !== 0
        ? (gainLoss / Math.abs(totalCost)) * 100
        : null;

    return {
      holdingId: h.id,
      holdingHref: h.href,
      securityName: sec?.content.name ?? "Unknown",
      ticker: sec?.content.ticker ?? "???",
      currency: sec?.content.currency ?? "",
      account: acc?.content.name ?? "Unknown",
      type: sec?.content.type ?? "",
      sector: sec?.content.sector ?? null,
      netQty: round2(netQty),
      avgCost: round2(avgCost),
      latestPrice: latestPrice !== null ? round2(latestPrice) : null,
      currentValue: currentValue !== null ? round2(currentValue) : null,
      gainLoss: gainLoss !== null ? round2(gainLoss) : null,
      gainLossPct: gainLossPct !== null ? round2(gainLossPct) : null,
    };
  });
}

function GainLossText({
  value,
  suffix,
}: {
  value: number | null;
  suffix?: string;
}) {
  if (value === null) return <Text color="secondary">N/A</Text>;
  const color =
    value >= 0
      ? theme.colors.semantic.success.text
      : theme.colors.semantic.error.text;
  const sign = value >= 0 ? "+" : "";
  return (
    <Text style={{ color }}>
      {sign}
      {value.toLocaleString()}
      {suffix}
    </Text>
  );
}

interface CurrencyBreakdown {
  currency: string;
  value: number;
  cost: number;
  gainLoss: number;
  gainLossPct: number;
}

function getCurrencyBreakdowns(rows: HoldingRow[]): CurrencyBreakdown[] {
  const byCurrency = new Map<string, { value: number; cost: number }>();
  for (const r of rows) {
    const entry = byCurrency.get(r.currency) ?? { value: 0, cost: 0 };
    entry.value += r.currentValue ?? 0;
    entry.cost += r.netQty * r.avgCost;
    byCurrency.set(r.currency, entry);
  }
  return Array.from(byCurrency.entries())
    .sort((a, b) => b[1].value - a[1].value)
    .map(([currency, { value, cost }]) => {
      const gainLoss = value - cost;
      const gainLossPct = cost !== 0 ? (gainLoss / Math.abs(cost)) * 100 : 0;
      return {
        currency,
        value: round2(value),
        cost: round2(cost),
        gainLoss: round2(gainLoss),
        gainLossPct: round2(gainLossPct),
      };
    });
}

function SummaryStats({ rows }: { rows: HoldingRow[] }) {
  const breakdowns = getCurrencyBreakdowns(rows);

  return (
    <Grid>
      <style>{`.summary-grid { --cols: 1; } .summary-grid p { margin: 8px 0 0 0; } @media (min-width: 768px) { .summary-grid { --cols: 2; } }`}</style>
      <Grid.Col span={{ sm: 12, md: 6 }}>
        <Tile>
          <Text color="secondary" size="sm">
            Total Value
          </Text>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(var(--cols, 1), 1fr)",
              gap: `0 ${theme.spacing._4}`,
            }}
            className="summary-grid"
          >
            {breakdowns.map((b) => (
              <Text key={b.currency} element="p" size="xl" weight="bold">
                {b.value.toLocaleString()} {b.currency}
              </Text>
            ))}
          </div>
        </Tile>
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6 }}>
        <Tile>
          <Text color="secondary" size="sm">
            Total Gain/Loss
          </Text>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(var(--cols, 1), 1fr)",
              gap: `0 ${theme.spacing._4}`,
            }}
            className="summary-grid"
          >
            {breakdowns.map((b) => (
              <Text
                key={b.currency}
                element="p"
                size="xl"
                weight="bold"
                style={{
                  color:
                    b.gainLoss >= 0
                      ? theme.colors.semantic.success.text
                      : theme.colors.semantic.error.text,
                }}
              >
                {b.gainLoss >= 0 ? "+" : ""}
                {b.gainLoss.toLocaleString()} {b.currency}{" "}
                <Text
                  size="sm"
                  weight="regular"
                  style={{
                    color:
                      b.gainLoss >= 0
                        ? theme.colors.semantic.success.text
                        : theme.colors.semantic.error.text,
                  }}
                >
                  ({b.gainLossPct}%)
                </Text>
              </Text>
            ))}
          </div>
        </Tile>
      </Grid.Col>
    </Grid>
  );
}

function TopGainers({ rows }: { rows: HoldingRow[] }) {
  const withPct = rows.filter((r) => r.gainLossPct !== null);
  const sorted = withPct
    .slice()
    .sort((a, b) => b.gainLossPct! - a.gainLossPct!);
  const gainers = sorted.slice(0, 5);

  return (
    <Tile>
      <Text
        element="h2"
        size="lg"
        weight="semibold"
        style={{ marginBottom: theme.spacing._4 }}
      >
        Top Gainers
      </Text>
      <Table ariaLabel="Top Gainers">
        <Table.Header>
          <Table.Column isRowHeader>Security</Table.Column>
          <Table.Column align="right">Value</Table.Column>
          <Table.Column align="right">Gain/Loss</Table.Column>
          <Table.Column align="right">%</Table.Column>
        </Table.Header>
        <Table.Body>
          {gainers.map((row) => (
            <Table.Row key={row.holdingId}>
              <Table.Cell>
                <Text weight="medium">{row.ticker}</Text>
              </Table.Cell>
              <Table.Cell align="right">
                {row.currentValue !== null
                  ? `${row.currentValue.toLocaleString()} ${row.currency}`
                  : "N/A"}
              </Table.Cell>
              <Table.Cell align="right">
                <GainLossText
                  value={row.gainLoss}
                  suffix={` ${row.currency}`}
                />
              </Table.Cell>
              <Table.Cell align="right">
                <GainLossText value={row.gainLossPct} suffix="%" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Tile>
  );
}

function TopLosers({ rows }: { rows: HoldingRow[] }) {
  const withPct = rows.filter((r) => r.gainLossPct !== null);
  const sorted = withPct
    .slice()
    .sort((a, b) => a.gainLossPct! - b.gainLossPct!);
  const losers = sorted.slice(0, 5);

  return (
    <Tile>
      <Text
        element="h2"
        size="lg"
        weight="semibold"
        style={{ marginBottom: theme.spacing._4 }}
      >
        Top Losers
      </Text>
      <Table ariaLabel="Top Losers">
        <Table.Header>
          <Table.Column isRowHeader>Security</Table.Column>
          <Table.Column align="right">Value</Table.Column>
          <Table.Column align="right">Gain/Loss</Table.Column>
          <Table.Column align="right">%</Table.Column>
        </Table.Header>
        <Table.Body>
          {losers.map((row) => (
            <Table.Row key={row.holdingId}>
              <Table.Cell>
                <Text weight="medium">{row.ticker}</Text>
              </Table.Cell>
              <Table.Cell align="right">
                {row.currentValue !== null
                  ? `${row.currentValue.toLocaleString()} ${row.currency}`
                  : "N/A"}
              </Table.Cell>
              <Table.Cell align="right">
                <GainLossText
                  value={row.gainLoss}
                  suffix={` ${row.currency}`}
                />
              </Table.Cell>
              <Table.Cell align="right">
                <GainLossText value={row.gainLossPct} suffix="%" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Tile>
  );
}

function AllocationChart({
  rows,
  groupBy,
  onGroupByChange,
}: {
  rows: HoldingRow[];
  groupBy: string;
  onGroupByChange: (v: string | null) => void;
}) {
  const currencies = [...new Set(rows.map((r) => r.currency))].sort();
  const seriesList: EChartsOption["series"] = [];
  const sliceWidth = 100 / currencies.length;

  currencies.forEach((currency, i) => {
    const currencyRows = rows.filter((r) => r.currency === currency);
    const groups = new Map<string, number>();
    for (const row of currencyRows) {
      if (row.currentValue === null) continue;
      const key =
        groupBy === "sector"
          ? (row.sector ?? "Unknown")
          : row.type || "Unknown";
      groups.set(key, (groups.get(key) ?? 0) + row.currentValue);
    }
    const data = Array.from(groups.entries()).map(([name, value]) => ({
      name,
      value: round2(value),
    }));
    const cx = `${round2(sliceWidth * (i + 0.5))}%`;
    seriesList.push({
      type: "pie",
      radius: ["25%", "45%"],
      center: [cx, "55%"],
      data,
      label: { show: true, formatter: "{b}: {d}%", fontSize: 11 },
      name: currency,
    });
  });

  const option: EChartsOption = {
    tooltip: { trigger: "item" },
    title: currencies.map((currency, i) => ({
      text: currency,
      left: `${round2((100 / currencies.length) * (i + 0.5))}%`,
      top: "0%",
      textAlign: "center" as const,
      textStyle: { fontSize: 13, fontWeight: "normal" as const },
    })),
    series: seriesList,
  };

  return (
    <Tile>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing._4,
        }}
      >
        <Text element="h2" size="lg" weight="semibold">
          Allocation
        </Text>
        <Select
          ariaLabel="Group by"
          layout="horizontal"
          value={groupBy}
          onChange={onGroupByChange}
          showClearButton={false}
          options={[
            { value: "type", label: "By Type" },
            { value: "sector", label: "By Sector" },
          ]}
        />
      </div>
      <Echart option={option} width="100%" height="350px" />
    </Tile>
  );
}

function PortfolioValueChart({ props }: { props: Props }) {
  const securities = props.collections.ProtoCollection_1.documents;
  const holdings = props.collections.ProtoCollection_2.documents;

  // Map each security to its currency
  const secCurrency = new Map<string, string>();
  for (const sec of securities) {
    secCurrency.set(sec.id, sec.content.currency);
  }

  // Build holding info with currency
  const holdingInfos = holdings.map((h) => ({
    secId: h.content.security.documentId,
    currency: secCurrency.get(h.content.security.documentId) ?? "???",
    netQty: computeNetQuantity(h.content.transactions),
  }));

  const currencies = [...new Set(holdingInfos.map((h) => h.currency))].sort();

  // Collect all price snapshots
  const allSnapshots: { instant: string; secId: string; price: number }[] = [];
  for (const sec of securities) {
    for (const snap of sec.content.priceHistory) {
      allSnapshots.push({
        instant: snap.instant,
        secId: sec.id,
        price: snap.price,
      });
    }
  }
  allSnapshots.sort((a, b) => a.instant.localeCompare(b.instant));
  const uniqueDates = [...new Set(allSnapshots.map((s) => s.instant))];

  // Build time series per currency
  const latestPrices = new Map<string, number>();
  const seriesByCurrency = new Map<string, [string, number][]>();
  for (const c of currencies) seriesByCurrency.set(c, []);

  for (const date of uniqueDates) {
    for (const snap of allSnapshots.filter((s) => s.instant === date)) {
      latestPrices.set(snap.secId, snap.price);
    }
    const totals = new Map<string, number>();
    for (const c of currencies) totals.set(c, 0);
    for (const hq of holdingInfos) {
      const price = latestPrices.get(hq.secId);
      if (price !== undefined) {
        totals.set(
          hq.currency,
          (totals.get(hq.currency) ?? 0) + hq.netQty * price,
        );
      }
    }
    for (const c of currencies) {
      seriesByCurrency.get(c)!.push([date, round2(totals.get(c) ?? 0)]);
    }
  }

  const series = currencies.map((currency) => ({
    type: "line" as const,
    name: currency,
    data: seriesByCurrency.get(currency)!,
    smooth: true,
    areaStyle: { opacity: 0.1 },
    showSymbol: false,
  }));

  const option: EChartsOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    legend: { data: currencies, top: 0 },
    grid: { left: 0, right: 0, top: 30, bottom: 0 },
    xAxis: { type: "time" },
    yAxis: { type: "value" },
    series,
  };

  return (
    <Tile>
      <Text
        element="h2"
        size="lg"
        weight="semibold"
        style={{ marginBottom: theme.spacing._4 }}
      >
        Portfolio Value Over Time
      </Text>
      <Echart option={option} width="100%" height="300px" />
    </Tile>
  );
}

function HoldingsTable({ rows }: { rows: HoldingRow[] }) {
  return (
    <Tile>
      <Text element="h2" size="lg" weight="semibold">
        Holdings
      </Text>
      <Table ariaLabel="Holdings">
        <Table.Header>
          <Table.Column isRowHeader>Security</Table.Column>
          <Table.Column>Account</Table.Column>
          <Table.Column align="right">Qty</Table.Column>
          <Table.Column align="right">Avg Cost</Table.Column>
          <Table.Column align="right">Price</Table.Column>
          <Table.Column align="right">Value</Table.Column>
          <Table.Column align="right">Gain/Loss</Table.Column>
          <Table.Column align="right">%</Table.Column>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.holdingId}>
              <Table.Cell>
                <Link href={row.holdingHref} target="_top">
                  {row.ticker}
                </Link>
                <Text color="secondary" size="xs">
                  {" "}
                  {row.securityName}
                </Text>
              </Table.Cell>
              <Table.Cell>{row.account}</Table.Cell>
              <Table.Cell align="right">{row.netQty}</Table.Cell>
              <Table.Cell align="right">
                {row.avgCost} {row.currency}
              </Table.Cell>
              <Table.Cell align="right">
                {row.latestPrice !== null
                  ? `${row.latestPrice} ${row.currency}`
                  : "N/A"}
              </Table.Cell>
              <Table.Cell align="right">
                {row.currentValue !== null
                  ? `${row.currentValue.toLocaleString()} ${row.currency}`
                  : "N/A"}
              </Table.Cell>
              <Table.Cell align="right">
                <GainLossText
                  value={row.gainLoss}
                  suffix={` ${row.currency}`}
                />
              </Table.Cell>
              <Table.Cell align="right">
                <GainLossText value={row.gainLossPct} suffix="%" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Tile>
  );
}

export default function App(props: Props): React.ReactElement | null {
  const [groupBy, setGroupBy] = React.useState("type");
  const rows = buildRows(props);

  return (
    <Grid>
      <Grid.Col span={{ sm: 12 }}>
        <SummaryStats rows={rows} />
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6 }}>
        <TopGainers rows={rows} />
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6 }}>
        <TopLosers rows={rows} />
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6 }}>
        <PortfolioValueChart props={props} />
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6 }}>
        <AllocationChart
          rows={rows}
          groupBy={groupBy}
          onGroupByChange={(v) => setGroupBy(v ?? "type")}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 12 }}>
        <HoldingsTable rows={rows} />
      </Grid.Col>
    </Grid>
  );
}
