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

function getLatestPrice(security) {
  if (security.priceHistory.length === 0) return null;
  return security.priceHistory
    .slice()
    .sort((a, b) => a.instant.localeCompare(b.instant))
    .at(-1).price;
}

function computeNetQuantity(transactions) {
  return transactions.reduce((sum, tx) => {
    return tx.type === "Buy" ? sum + tx.quantity : sum - tx.quantity;
  }, 0);
}

function computeAvgBuyCost(transactions) {
  const buys = transactions.filter((tx) => tx.type === "Buy");
  const totalQty = buys.reduce((s, tx) => s + tx.quantity, 0);
  if (totalQty === 0) return 0;
  const totalCost = buys.reduce(
    (s, tx) => s + tx.quantity * tx.pricePerUnit,
    0,
  );
  return totalCost / totalQty;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function buildRows(props) {
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

function GainLossText({ value, suffix }) {
  if (value === null)
    return React.createElement(Text, { color: "secondary" }, "N/A");
  const color =
    value >= 0
      ? theme.colors.semantic.success.text
      : theme.colors.semantic.error.text;
  const sign = value >= 0 ? "+" : "";
  return React.createElement(
    Text,
    { style: { color } },
    sign,
    value.toLocaleString(),
    suffix,
  );
}

function getCurrencyBreakdowns(rows) {
  const byCurrency = new Map();
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

function SummaryStats({ rows }) {
  const breakdowns = getCurrencyBreakdowns(rows);

  return React.createElement(
    Grid,
    null,
    React.createElement("style", null, ".summary-grid { --cols: 1; } .summary-grid p { margin: 8px 0 0 0; } @media (min-width: 768px) { .summary-grid { --cols: 2; } }"),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6 } },
      React.createElement(
        Tile,
        null,
        React.createElement(Text, { color: "secondary", size: "sm" }, "Total Value"),
        React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(var(--cols, 1), 1fr)",
              gap: `0 ${theme.spacing._4}`,
            },
            className: "summary-grid",
          },
          breakdowns.map((b) =>
            React.createElement(
              Text,
              { key: b.currency, element: "p", size: "xl", weight: "bold" },
              b.value.toLocaleString(),
              " ",
              b.currency,
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6 } },
      React.createElement(
        Tile,
        null,
        React.createElement(Text, { color: "secondary", size: "sm" }, "Total Gain/Loss"),
        React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(var(--cols, 1), 1fr)",
              gap: `0 ${theme.spacing._4}`,
            },
            className: "summary-grid",
          },
          breakdowns.map((b) =>
            React.createElement(
              Text,
              {
                key: b.currency,
                element: "p",
                size: "xl",
                weight: "bold",
                style: {
                  color:
                    b.gainLoss >= 0
                      ? theme.colors.semantic.success.text
                      : theme.colors.semantic.error.text,
                },
              },
              b.gainLoss >= 0 ? "+" : "",
              b.gainLoss.toLocaleString(),
              " ",
              b.currency,
              " ",
              React.createElement(
                Text,
                {
                  size: "sm",
                  weight: "regular",
                  style: {
                    color:
                      b.gainLoss >= 0
                        ? theme.colors.semantic.success.text
                        : theme.colors.semantic.error.text,
                  },
                },
                "(",
                b.gainLossPct,
                "%)",
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

function TopGainers({ rows }) {
  const withPct = rows.filter((r) => r.gainLossPct !== null);
  const sorted = withPct
    .slice()
    .sort((a, b) => b.gainLossPct - a.gainLossPct);
  const gainers = sorted.slice(0, 5);

  return React.createElement(
    Tile,
    null,
    React.createElement(
      Text,
      { element: "h2", size: "lg", weight: "semibold", style: { marginBottom: theme.spacing._4 } },
      "Top Gainers",
    ),
    React.createElement(
      Table,
      { ariaLabel: "Top Gainers" },
      React.createElement(
        Table.Header,
        null,
        React.createElement(Table.Column, { isRowHeader: true }, "Security"),
        React.createElement(Table.Column, { align: "right" }, "Value"),
        React.createElement(Table.Column, { align: "right" }, "Gain/Loss"),
        React.createElement(Table.Column, { align: "right" }, "%"),
      ),
      React.createElement(
        Table.Body,
        null,
        gainers.map((row) =>
          React.createElement(
            Table.Row,
            { key: row.holdingId },
            React.createElement(
              Table.Cell,
              null,
              React.createElement(Text, { weight: "medium" }, row.ticker),
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              row.currentValue !== null
                ? `${row.currentValue.toLocaleString()} ${row.currency}`
                : "N/A",
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              React.createElement(GainLossText, { value: row.gainLoss, suffix: ` ${row.currency}` }),
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              React.createElement(GainLossText, { value: row.gainLossPct, suffix: "%" }),
            ),
          ),
        ),
      ),
    ),
  );
}

function TopLosers({ rows }) {
  const withPct = rows.filter((r) => r.gainLossPct !== null);
  const sorted = withPct
    .slice()
    .sort((a, b) => a.gainLossPct - b.gainLossPct);
  const losers = sorted.slice(0, 5);

  return React.createElement(
    Tile,
    null,
    React.createElement(
      Text,
      { element: "h2", size: "lg", weight: "semibold", style: { marginBottom: theme.spacing._4 } },
      "Top Losers",
    ),
    React.createElement(
      Table,
      { ariaLabel: "Top Losers" },
      React.createElement(
        Table.Header,
        null,
        React.createElement(Table.Column, { isRowHeader: true }, "Security"),
        React.createElement(Table.Column, { align: "right" }, "Value"),
        React.createElement(Table.Column, { align: "right" }, "Gain/Loss"),
        React.createElement(Table.Column, { align: "right" }, "%"),
      ),
      React.createElement(
        Table.Body,
        null,
        losers.map((row) =>
          React.createElement(
            Table.Row,
            { key: row.holdingId },
            React.createElement(
              Table.Cell,
              null,
              React.createElement(Text, { weight: "medium" }, row.ticker),
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              row.currentValue !== null
                ? `${row.currentValue.toLocaleString()} ${row.currency}`
                : "N/A",
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              React.createElement(GainLossText, { value: row.gainLoss, suffix: ` ${row.currency}` }),
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              React.createElement(GainLossText, { value: row.gainLossPct, suffix: "%" }),
            ),
          ),
        ),
      ),
    ),
  );
}

function AllocationChart({ rows, groupBy, onGroupByChange }) {
  const currencies = [...new Set(rows.map((r) => r.currency))].sort();
  const seriesList = [];
  const sliceWidth = 100 / currencies.length;

  currencies.forEach((currency, i) => {
    const currencyRows = rows.filter((r) => r.currency === currency);
    const groups = new Map();
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

  const option = {
    tooltip: { trigger: "item" },
    title: currencies.map((currency, i) => ({
      text: currency,
      left: `${round2((100 / currencies.length) * (i + 0.5))}%`,
      top: "0%",
      textAlign: "center",
      textStyle: { fontSize: 13, fontWeight: "normal" },
    })),
    series: seriesList,
  };

  return React.createElement(
    Tile,
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing._4,
        },
      },
      React.createElement(Text, { element: "h2", size: "lg", weight: "semibold" }, "Allocation"),
      React.createElement(Select, {
        ariaLabel: "Group by",
        layout: "horizontal",
        value: groupBy,
        onChange: onGroupByChange,
        showClearButton: false,
        options: [
          { value: "type", label: "By Type" },
          { value: "sector", label: "By Sector" },
        ],
      }),
    ),
    React.createElement(Echart, { option, width: "100%", height: "350px" }),
  );
}

function PortfolioValueChart({ props }) {
  const securities = props.collections.ProtoCollection_1.documents;
  const holdings = props.collections.ProtoCollection_2.documents;

  const secCurrency = new Map();
  for (const sec of securities) {
    secCurrency.set(sec.id, sec.content.currency);
  }

  const holdingInfos = holdings.map((h) => ({
    secId: h.content.security.documentId,
    currency: secCurrency.get(h.content.security.documentId) ?? "???",
    netQty: computeNetQuantity(h.content.transactions),
  }));

  const currencies = [...new Set(holdingInfos.map((h) => h.currency))].sort();

  const allSnapshots = [];
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

  const latestPrices = new Map();
  const seriesByCurrency = new Map();
  for (const c of currencies) seriesByCurrency.set(c, []);

  for (const date of uniqueDates) {
    for (const snap of allSnapshots.filter((s) => s.instant === date)) {
      latestPrices.set(snap.secId, snap.price);
    }
    const totals = new Map();
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
      seriesByCurrency.get(c).push([date, round2(totals.get(c) ?? 0)]);
    }
  }

  const series = currencies.map((currency) => ({
    type: "line",
    name: currency,
    data: seriesByCurrency.get(currency),
    smooth: true,
    areaStyle: { opacity: 0.1 },
    showSymbol: false,
  }));

  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    legend: { data: currencies, top: 0 },
    grid: { left: 0, right: 0, top: 30, bottom: 0 },
    xAxis: { type: "time" },
    yAxis: { type: "value" },
    series,
  };

  return React.createElement(
    Tile,
    null,
    React.createElement(
      Text,
      { element: "h2", size: "lg", weight: "semibold", style: { marginBottom: theme.spacing._4 } },
      "Portfolio Value Over Time",
    ),
    React.createElement(Echart, { option, width: "100%", height: "300px" }),
  );
}

function HoldingsTable({ rows }) {
  return React.createElement(
    Tile,
    null,
    React.createElement(Text, { element: "h2", size: "lg", weight: "semibold" }, "Holdings"),
    React.createElement(
      Table,
      { ariaLabel: "Holdings" },
      React.createElement(
        Table.Header,
        null,
        React.createElement(Table.Column, { isRowHeader: true }, "Security"),
        React.createElement(Table.Column, null, "Account"),
        React.createElement(Table.Column, { align: "right" }, "Qty"),
        React.createElement(Table.Column, { align: "right" }, "Avg Cost"),
        React.createElement(Table.Column, { align: "right" }, "Price"),
        React.createElement(Table.Column, { align: "right" }, "Value"),
        React.createElement(Table.Column, { align: "right" }, "Gain/Loss"),
        React.createElement(Table.Column, { align: "right" }, "%"),
      ),
      React.createElement(
        Table.Body,
        null,
        rows.map((row) =>
          React.createElement(
            Table.Row,
            { key: row.holdingId },
            React.createElement(
              Table.Cell,
              null,
              React.createElement(Link, { href: row.holdingHref, target: "_top" }, row.ticker),
              React.createElement(Text, { color: "secondary", size: "xs" }, " ", row.securityName),
            ),
            React.createElement(Table.Cell, null, row.account),
            React.createElement(Table.Cell, { align: "right" }, row.netQty),
            React.createElement(Table.Cell, { align: "right" }, row.avgCost, " ", row.currency),
            React.createElement(
              Table.Cell,
              { align: "right" },
              row.latestPrice !== null
                ? `${row.latestPrice} ${row.currency}`
                : "N/A",
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              row.currentValue !== null
                ? `${row.currentValue.toLocaleString()} ${row.currency}`
                : "N/A",
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              React.createElement(GainLossText, { value: row.gainLoss, suffix: ` ${row.currency}` }),
            ),
            React.createElement(
              Table.Cell,
              { align: "right" },
              React.createElement(GainLossText, { value: row.gainLossPct, suffix: "%" }),
            ),
          ),
        ),
      ),
    ),
  );
}

export default function App(props) {
  const [groupBy, setGroupBy] = React.useState("type");
  const rows = buildRows(props);

  return React.createElement(
    Grid,
    null,
    React.createElement(
      Grid.Col,
      { span: { sm: 12 } },
      React.createElement(SummaryStats, { rows }),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6 } },
      React.createElement(TopGainers, { rows }),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6 } },
      React.createElement(TopLosers, { rows }),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6 } },
      React.createElement(PortfolioValueChart, { props }),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6 } },
      React.createElement(AllocationChart, {
        rows,
        groupBy,
        onGroupByChange: (v) => setGroupBy(v ?? "type"),
      }),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12 } },
      React.createElement(HoldingsTable, { rows }),
    ),
  );
}
