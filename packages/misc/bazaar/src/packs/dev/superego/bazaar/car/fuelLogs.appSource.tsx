import {
  Alert,
  Button,
  Echart,
  Grid,
  Select,
  Table,
  Text,
  Tile,
} from "@superego/app-sandbox/components";
import React from "react";
import type * as ProtoCollection_0 from "./ProtoCollection_0.js";

interface Props {
  collections: {
    /**
     * "Fuel Logs" collection.
     */
    ProtoCollection_0: {
      id: "ProtoCollection_0";
      displayName: string;
      documents: {
        id: `Document_${string}`;
        content: ProtoCollection_0.FuelLog;
      }[];
    };
  };
}

type PeriodType = "1-month" | "3-months" | "6-months" | "1-year";

interface PeriodState {
  type: PeriodType;
  startDate: Date;
  endDate: Date;
}

function getPeriodDates(
  type: PeriodType,
  baseDate: Date,
): { startDate: Date; endDate: Date } {
  const endDate = new Date(baseDate);
  const startDate = new Date(baseDate);

  switch (type) {
    case "1-month":
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case "3-months":
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case "6-months":
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case "1-year":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }

  // Set end date to end of day
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

function shiftPeriod(
  period: PeriodState,
  direction: "forward" | "backward",
): PeriodState {
  const { type } = period;
  let shiftAmount: number;

  switch (type) {
    case "1-month":
      shiftAmount = 1;
      break;
    case "3-months":
      shiftAmount = 3;
      break;
    case "6-months":
      shiftAmount = 6;
      break;
    case "1-year":
      shiftAmount = 12;
      break;
    default:
      shiftAmount = 1;
  }

  const newStartDate = new Date(period.startDate);
  const newEndDate = new Date(period.endDate);

  if (direction === "forward") {
    if (type === "1-year") {
      newStartDate.setFullYear(newStartDate.getFullYear() + 1);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    } else {
      newStartDate.setMonth(newStartDate.getMonth() + shiftAmount);
      newEndDate.setMonth(newEndDate.getMonth() + shiftAmount);
    }
  } else {
    if (type === "1-year") {
      newStartDate.setFullYear(newStartDate.getFullYear() - 1);
      newEndDate.setFullYear(newEndDate.getFullYear() - 1);
    } else {
      newStartDate.setMonth(newStartDate.getMonth() - shiftAmount);
      newEndDate.setMonth(newEndDate.getMonth() - shiftAmount);
    }
  }

  return {
    type,
    startDate: newStartDate,
    endDate: newEndDate,
  };
}

export default function App(props: Props): React.ReactElement | null {
  const { documents } = props.collections.ProtoCollection_0;

  // Initialize period state to end today
  const [period, setPeriod] = React.useState<PeriodState>(() => {
    const today = new Date();
    const { startDate, endDate } = getPeriodDates("1-month", today);
    // Set start date to be exactly one month before today
    const adjustedStart = new Date(today);
    adjustedStart.setMonth(adjustedStart.getMonth() - 1);
    return {
      type: "1-month",
      startDate: adjustedStart,
      endDate: today,
    };
  });

  const handlePeriodTypeChange = (newType: string) => {
    const periodType = newType as PeriodType;
    const today = new Date();
    const { startDate, endDate } = getPeriodDates(periodType, today);
    // Adjust start date to end today instead of starting from today
    const adjustedEnd = new Date(today);
    const adjustedStart = new Date(today);

    switch (periodType) {
      case "1-month":
        adjustedStart.setMonth(adjustedStart.getMonth() - 1);
        break;
      case "3-months":
        adjustedStart.setMonth(adjustedStart.getMonth() - 3);
        break;
      case "6-months":
        adjustedStart.setMonth(adjustedStart.getMonth() - 6);
        break;
      case "1-year":
        adjustedStart.setFullYear(adjustedStart.getFullYear() - 1);
        break;
    }

    setPeriod({
      type: periodType,
      startDate: adjustedStart,
      endDate: adjustedEnd,
    });
  };

  const handlePeriodShift = (direction: "forward" | "backward") => {
    setPeriod((prev) => shiftPeriod(prev, direction));
  };

  if (documents.length === 0) {
    return (
      <Grid>
        <Grid.Col span={{ sm: 12, md: 12, lg: 12 }}>
          <Alert variant="neutral" title="No fuel logs found">
            <Text element="p" color="secondary">
              Start by adding your first fuel log to see statistics and charts.
            </Text>
          </Alert>
        </Grid.Col>
      </Grid>
    );
  }

  // Filter documents based on selected period
  const filteredDocuments = documents.filter((doc) => {
    const docDate = new Date(doc.content.timestamp);
    return docDate >= period.startDate && docDate <= period.endDate;
  });

  if (filteredDocuments.length === 0) {
    return (
      <Grid>
        <Grid.Col span={{ sm: 12, md: 12, lg: 12 }}>
          <Tile>
            <div style={{ display: "flex", gap: "16px" }}>
              <Select
                value={period.type}
                onChange={handlePeriodTypeChange}
                ariaLabel="Select time period"
                options={[
                  { value: "1-month", label: "1 Month" },
                  { value: "3-months", label: "3 Months" },
                  { value: "6-months", label: "6 Months" },
                  { value: "1-year", label: "1 Year" },
                ]}
              />
              <Button onPress={() => handlePeriodShift("backward")}>
                ← Previous
              </Button>
              <Button onPress={() => handlePeriodShift("forward")}>
                Next →
              </Button>
              <Text color="secondary" size="sm" style={{ lineHeight: "2rem" }}>
                {period.startDate.toLocaleDateString()} -{" "}
                {period.endDate.toLocaleDateString()}
              </Text>
            </div>
          </Tile>
          <Grid.Col span={{ sm: 12, md: 12, lg: 12 }}>
            <Alert variant="neutral" title="No fuel logs in selected period">
              <Text element="p" color="secondary">
                Try selecting a different time period or navigate to see data
                from other time ranges.
              </Text>
            </Alert>
          </Grid.Col>
        </Grid.Col>
      </Grid>
    );
  }

  // Sort filtered documents by timestamp
  const sortedDocuments = [...filteredDocuments].sort(
    (a, b) =>
      new Date(a.content.timestamp).getTime() -
      new Date(b.content.timestamp).getTime(),
  );

  // Calculate statistics for filtered period
  const totalFuel = sortedDocuments.reduce(
    (sum, doc) => sum + doc.content.liters,
    0,
  );
  const totalCost = sortedDocuments.reduce(
    (sum, doc) => sum + doc.content.totalCost,
    0,
  );
  const avgCostPerLiter = totalFuel > 0 ? totalCost / totalFuel : 0;
  const totalDistance =
    sortedDocuments.length > 0
      ? sortedDocuments[sortedDocuments.length - 1].content.odometer -
        sortedDocuments[0].content.odometer
      : 0;
  const avgFuelEfficiency =
    totalFuel > 0 && totalDistance > 0 ? totalDistance / totalFuel : 0;

  // Prepare chart data
  const chartData = sortedDocuments.map((doc) => ({
    timestamp: new Date(doc.content.timestamp).getTime(),
    costPerLiter:
      Math.round((doc.content.totalCost / doc.content.liters) * 100) / 100,
    liters: doc.content.liters,
    odometer: doc.content.odometer,
  }));

  // Calculate fuel efficiency between refuels
  const efficiencyData = [];
  for (let i = 1; i < sortedDocuments.length; i++) {
    const prev = sortedDocuments[i - 1].content;
    const curr = sortedDocuments[i].content;
    if (prev.fullTank && curr.fullTank) {
      const distance = curr.odometer - prev.odometer;
      const fuel = curr.liters;
      if (distance > 0 && fuel > 0) {
        efficiencyData.push({
          timestamp: new Date(curr.timestamp).getTime(),
          efficiency: Math.round((distance / fuel) * 100) / 100,
        });
      }
    }
  }

  return (
    <Grid>
      {/* Period Controls */}
      <Grid.Col span={{ sm: 12, md: 12, lg: 12 }}>
        <Tile>
          <div style={{ display: "flex", gap: "16px" }}>
            <Select
              value={period.type}
              onChange={handlePeriodTypeChange}
              ariaLabel="Select time period"
              options={[
                { value: "1-month", label: "1 Month" },
                { value: "3-months", label: "3 Months" },
                { value: "6-months", label: "6 Months" },
                { value: "1-year", label: "1 Year" },
              ]}
            />
            <Button onPress={() => handlePeriodShift("backward")}>
              ← Previous
            </Button>
            <Button onPress={() => handlePeriodShift("forward")}>Next →</Button>
            <Text color="secondary" size="sm" style={{ lineHeight: "2rem" }}>
              {period.startDate.toLocaleDateString()} -{" "}
              {period.endDate.toLocaleDateString()}
            </Text>
          </div>
        </Tile>
      </Grid.Col>

      {/* Statistics Cards */}
      <Grid.Col span={{ sm: 12, md: 6, lg: 3 }}>
        <Tile>
          <Text element="h3" size="lg" weight="semibold">
            Total Fuel
          </Text>
          <Text element="p" size="xl2" weight="bold" color="primary">
            {Math.round(totalFuel * 100) / 100} L
          </Text>
          <Text element="p" size="sm" color="secondary">
            Across {sortedDocuments.length} refuels
          </Text>
        </Tile>
      </Grid.Col>

      <Grid.Col span={{ sm: 12, md: 6, lg: 3 }}>
        <Tile>
          <Text element="h3" size="lg" weight="semibold">
            Total Cost
          </Text>
          <Text element="p" size="xl2" weight="bold" color="primary">
            €{Math.round(totalCost * 100) / 100}
          </Text>
          <Text element="p" size="sm" color="secondary">
            Avg: €{Math.round(avgCostPerLiter * 100) / 100}/L
          </Text>
        </Tile>
      </Grid.Col>

      <Grid.Col span={{ sm: 12, md: 6, lg: 3 }}>
        <Tile>
          <Text element="h3" size="lg" weight="semibold">
            Distance
          </Text>
          <Text element="p" size="xl2" weight="bold" color="primary">
            {Math.round(totalDistance)} km
          </Text>
          <Text element="p" size="sm" color="secondary">
            Total traveled
          </Text>
        </Tile>
      </Grid.Col>

      <Grid.Col span={{ sm: 12, md: 6, lg: 3 }}>
        <Tile>
          <Text element="h3" size="lg" weight="semibold">
            Avg Efficiency
          </Text>
          <Text element="p" size="xl2" weight="bold" color="primary">
            {Math.round(avgFuelEfficiency * 100) / 100} km/L
          </Text>
          <Text element="p" size="sm" color="secondary">
            Overall average
          </Text>
        </Tile>
      </Grid.Col>

      {/* Cost per Liter Over Time */}
      <Grid.Col span={{ sm: 12, md: 12, lg: 12 }}>
        <Tile style={{ height: "400px" }}>
          <Text element="h3" size="lg" weight="semibold">
            Cost per Liter Over Time
          </Text>
          <Echart
            width="100%"
            height="320px"
            option={{
              tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
              grid: { left: 0, right: 0, top: 0, bottom: 0 },
              xAxis: {
                type: "time",
                name: undefined,
              },
              yAxis: {
                type: "value",
                name: undefined,
                min: Math.max(
                  0,
                  Math.min(...chartData.map((d) => d.costPerLiter)) * 0.95,
                ),
                max: Math.max(...chartData.map((d) => d.costPerLiter)) * 1.05,
              },
              series: [
                {
                  type: "line",
                  data: chartData.map((d) => [d.timestamp, d.costPerLiter]),
                  smooth: true,
                },
              ],
            }}
          />
        </Tile>
      </Grid.Col>

      {/* Fuel Efficiency Trend */}
      {efficiencyData.length > 0 && (
        <Grid.Col span={{ sm: 12, md: 12, lg: 6 }}>
          <Tile>
            <Text element="h3" size="lg" weight="semibold">
              Fuel Efficiency Trend
            </Text>
            <Echart
              width="100%"
              height="320px"
              option={{
                tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
                grid: { left: 0, right: 0, top: 0, bottom: 0 },
                xAxis: {
                  type: "time",
                  name: undefined,
                },
                yAxis: {
                  type: "value",
                  name: undefined,
                  min: Math.max(
                    0,
                    Math.min(...efficiencyData.map((d) => d.efficiency)) * 0.95,
                  ),
                  max:
                    Math.max(...efficiencyData.map((d) => d.efficiency)) * 1.05,
                },
                series: [
                  {
                    type: "line",
                    data: efficiencyData.map((d) => [
                      d.timestamp,
                      d.efficiency,
                    ]),
                    smooth: true,
                  },
                ],
              }}
            />
          </Tile>
        </Grid.Col>
      )}

      {/* Fuel Volume Over Time */}
      <Grid.Col
        span={{ sm: 12, md: 12, lg: efficiencyData.length > 0 ? 6 : 12 }}
      >
        <Tile>
          <Text element="h3" size="lg" weight="semibold">
            Fuel Volume Over Time
          </Text>
          <Echart
            width="100%"
            height="320px"
            option={{
              tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
              grid: { left: 0, right: 0, top: 0, bottom: 0 },
              xAxis: {
                type: "time",
                name: undefined,
              },
              yAxis: {
                type: "value",
                name: undefined,
                min: 0,
                max: Math.max(...chartData.map((d) => d.liters)) * 1.05,
              },
              series: [
                {
                  type: "bar",
                  data: chartData.map((d) => [
                    d.timestamp,
                    Math.round(d.liters * 100) / 100,
                  ]),
                },
              ],
            }}
          />
        </Tile>
      </Grid.Col>

      {/* Recent Fuel Logs Table */}
      <Grid.Col span={{ sm: 12, md: 12, lg: 12 }}>
        <Tile>
          <Text element="h3" size="lg" weight="semibold">
            Fuel Logs in Selected Period
          </Text>
          <Table ariaLabel="Fuel logs in selected period">
            <Table.Header>
              <Table.Column isRowHeader>Date</Table.Column>
              <Table.Column align="right">Odometer</Table.Column>
              <Table.Column align="right">Liters</Table.Column>
              <Table.Column align="right">Cost</Table.Column>
              <Table.Column align="right">Cost/L</Table.Column>
              <Table.Column align="center">Full Tank</Table.Column>
              <Table.Column>Fuel Type</Table.Column>
            </Table.Header>
            <Table.Body>
              {sortedDocuments
                .slice(-10)
                .reverse()
                .map((doc) => (
                  <Table.Row key={doc.id}>
                    <Table.Cell>
                      {new Date(doc.content.timestamp).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell align="right">
                      {doc.content.odometer.toLocaleString()} km
                    </Table.Cell>
                    <Table.Cell align="right">
                      {Math.round(doc.content.liters * 100) / 100} L
                    </Table.Cell>
                    <Table.Cell align="right">
                      €{Math.round(doc.content.totalCost * 100) / 100}
                    </Table.Cell>
                    <Table.Cell align="right">
                      €
                      {Math.round(
                        (doc.content.totalCost / doc.content.liters) * 100,
                      ) / 100}
                    </Table.Cell>
                    <Table.Cell align="center">
                      {doc.content.fullTank ? "✓" : "✗"}
                    </Table.Cell>
                    <Table.Cell>{doc.content.fuelType || "-"}</Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
        </Tile>
      </Grid.Col>
    </Grid>
  );
}
