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

function getPeriodDates(type, baseDate) {
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
function shiftPeriod(period, direction) {
  const { type } = period;
  let shiftAmount;
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
export default function App(props) {
  const { documents } = props.collections.$COLLECTION_ID;
  // Initialize period state to end today
  const [period, setPeriod] = React.useState(() => {
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
  const handlePeriodTypeChange = (newType) => {
    const periodType = newType;
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
  const handlePeriodShift = (direction) => {
    setPeriod((prev) => shiftPeriod(prev, direction));
  };
  if (documents.length === 0) {
    return React.createElement(
      Grid,
      null,
      React.createElement(
        Grid.Col,
        { span: { sm: 12, md: 12, lg: 12 } },
        React.createElement(
          Alert,
          { variant: "neutral", title: "No fuel logs found" },
          React.createElement(
            Text,
            { element: "p", color: "secondary" },
            "Start by adding your first fuel log to see statistics and charts.",
          ),
        ),
      ),
    );
  }
  // Filter documents based on selected period
  const filteredDocuments = documents.filter((doc) => {
    const docDate = new Date(doc.content.timestamp);
    return docDate >= period.startDate && docDate <= period.endDate;
  });
  if (filteredDocuments.length === 0) {
    return React.createElement(
      Grid,
      null,
      React.createElement(
        Grid.Col,
        { span: { sm: 12, md: 12, lg: 12 } },
        React.createElement(
          Tile,
          null,
          React.createElement(
            "div",
            { style: { display: "flex", gap: "16px" } },
            React.createElement(Select, {
              value: period.type,
              onChange: handlePeriodTypeChange,
              ariaLabel: "Select time period",
              options: [
                { value: "1-month", label: "1 Month" },
                { value: "3-months", label: "3 Months" },
                { value: "6-months", label: "6 Months" },
                { value: "1-year", label: "1 Year" },
              ],
            }),
            React.createElement(
              Button,
              { onPress: () => handlePeriodShift("backward") },
              "\u2190 Previous",
            ),
            React.createElement(
              Button,
              { onPress: () => handlePeriodShift("forward") },
              "Next \u2192",
            ),
            React.createElement(
              Text,
              { color: "secondary", size: "sm", style: { lineHeight: "2rem" } },
              period.startDate.toLocaleDateString(),
              " - ",
              period.endDate.toLocaleDateString(),
            ),
          ),
        ),
        React.createElement(
          Grid.Col,
          { span: { sm: 12, md: 12, lg: 12 } },
          React.createElement(
            Alert,
            { variant: "neutral", title: "No fuel logs in selected period" },
            React.createElement(
              Text,
              { element: "p", color: "secondary" },
              "Try selecting a different time period or navigate to see data from other time ranges.",
            ),
          ),
        ),
      ),
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
  return React.createElement(
    Grid,
    null,
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 12, lg: 12 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          "div",
          { style: { display: "flex", gap: "16px" } },
          React.createElement(Select, {
            value: period.type,
            onChange: handlePeriodTypeChange,
            ariaLabel: "Select time period",
            options: [
              { value: "1-month", label: "1 Month" },
              { value: "3-months", label: "3 Months" },
              { value: "6-months", label: "6 Months" },
              { value: "1-year", label: "1 Year" },
            ],
          }),
          React.createElement(
            Button,
            { onPress: () => handlePeriodShift("backward") },
            "\u2190 Previous",
          ),
          React.createElement(
            Button,
            { onPress: () => handlePeriodShift("forward") },
            "Next \u2192",
          ),
          React.createElement(
            Text,
            { color: "secondary", size: "sm", style: { lineHeight: "2rem" } },
            period.startDate.toLocaleDateString(),
            " - ",
            period.endDate.toLocaleDateString(),
          ),
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 3 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          { element: "h3", size: "lg", weight: "semibold" },
          "Total Fuel",
        ),
        React.createElement(
          Text,
          { element: "p", size: "xl2", weight: "bold", color: "primary" },
          Math.round(totalFuel * 100) / 100,
          " L",
        ),
        React.createElement(
          Text,
          { element: "p", size: "sm", color: "secondary" },
          "Across ",
          sortedDocuments.length,
          " refuels",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 3 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          { element: "h3", size: "lg", weight: "semibold" },
          "Total Cost",
        ),
        React.createElement(
          Text,
          { element: "p", size: "xl2", weight: "bold", color: "primary" },
          "\u20AC",
          Math.round(totalCost * 100) / 100,
        ),
        React.createElement(
          Text,
          { element: "p", size: "sm", color: "secondary" },
          "Avg: \u20AC",
          Math.round(avgCostPerLiter * 100) / 100,
          "/L",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 3 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          { element: "h3", size: "lg", weight: "semibold" },
          "Distance",
        ),
        React.createElement(
          Text,
          { element: "p", size: "xl2", weight: "bold", color: "primary" },
          Math.round(totalDistance),
          " km",
        ),
        React.createElement(
          Text,
          { element: "p", size: "sm", color: "secondary" },
          "Total traveled",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 3 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          { element: "h3", size: "lg", weight: "semibold" },
          "Avg Efficiency",
        ),
        React.createElement(
          Text,
          { element: "p", size: "xl2", weight: "bold", color: "primary" },
          Math.round(avgFuelEfficiency * 100) / 100,
          " km/L",
        ),
        React.createElement(
          Text,
          { element: "p", size: "sm", color: "secondary" },
          "Overall average",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 12, lg: 12 } },
      React.createElement(
        Tile,
        { style: { height: "400px" } },
        React.createElement(
          Text,
          { element: "h3", size: "lg", weight: "semibold" },
          "Cost per Liter Over Time",
        ),
        React.createElement(Echart, {
          width: "100%",
          height: "320px",
          option: {
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
          },
        }),
      ),
    ),
    efficiencyData.length > 0 &&
      React.createElement(
        Grid.Col,
        { span: { sm: 12, md: 12, lg: 6 } },
        React.createElement(
          Tile,
          null,
          React.createElement(
            Text,
            { element: "h3", size: "lg", weight: "semibold" },
            "Fuel Efficiency Trend",
          ),
          React.createElement(Echart, {
            width: "100%",
            height: "320px",
            option: {
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
                  data: efficiencyData.map((d) => [d.timestamp, d.efficiency]),
                  smooth: true,
                },
              ],
            },
          }),
        ),
      ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 12, lg: efficiencyData.length > 0 ? 6 : 12 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          { element: "h3", size: "lg", weight: "semibold" },
          "Fuel Volume Over Time",
        ),
        React.createElement(Echart, {
          width: "100%",
          height: "320px",
          option: {
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
          },
        }),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 12, lg: 12 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          { element: "h3", size: "lg", weight: "semibold" },
          "Fuel Logs in Selected Period",
        ),
        React.createElement(
          Table,
          { ariaLabel: "Fuel logs in selected period" },
          React.createElement(
            Table.Header,
            null,
            React.createElement(Table.Column, { isRowHeader: true }, "Date"),
            React.createElement(Table.Column, { align: "right" }, "Odometer"),
            React.createElement(Table.Column, { align: "right" }, "Liters"),
            React.createElement(Table.Column, { align: "right" }, "Cost"),
            React.createElement(Table.Column, { align: "right" }, "Cost/L"),
            React.createElement(Table.Column, { align: "center" }, "Full Tank"),
            React.createElement(Table.Column, null, "Fuel Type"),
          ),
          React.createElement(
            Table.Body,
            null,
            sortedDocuments
              .slice(-10)
              .reverse()
              .map((doc) =>
                React.createElement(
                  Table.Row,
                  { key: doc.id },
                  React.createElement(
                    Table.Cell,
                    null,
                    new Date(doc.content.timestamp).toLocaleDateString(),
                  ),
                  React.createElement(
                    Table.Cell,
                    { align: "right" },
                    doc.content.odometer.toLocaleString(),
                    " km",
                  ),
                  React.createElement(
                    Table.Cell,
                    { align: "right" },
                    Math.round(doc.content.liters * 100) / 100,
                    " L",
                  ),
                  React.createElement(
                    Table.Cell,
                    { align: "right" },
                    "\u20AC",
                    Math.round(doc.content.totalCost * 100) / 100,
                  ),
                  React.createElement(
                    Table.Cell,
                    { align: "right" },
                    "\u20AC",
                    Math.round(
                      (doc.content.totalCost / doc.content.liters) * 100,
                    ) / 100,
                  ),
                  React.createElement(
                    Table.Cell,
                    { align: "center" },
                    doc.content.fullTank ? "✓" : "✗",
                  ),
                  React.createElement(
                    Table.Cell,
                    null,
                    doc.content.fuelType || "-",
                  ),
                ),
              ),
          ),
        ),
      ),
    ),
  );
}
