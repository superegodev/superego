import {
  Echart,
  Grid,
  Select,
  Table,
  Text,
  Tile,
} from "@superego/app-sandbox/components";
import React, { useMemo, useState } from "react";
export default function App(props) {
  const expenses = props.collections.ProtoCollection_0.documents;
  // Get unique months from expenses
  const monthOptions = useMemo(() => {
    const months = new Set();
    expenses.forEach((doc) => {
      const date = new Date(doc.content.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months)
      .sort()
      .reverse()
      .map((month) => {
        const [year, monthNum] = month.split("-");
        const date = new Date(
          Number.parseInt(year),
          Number.parseInt(monthNum) - 1,
        );
        const label = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });
        return { value: month, label };
      });
  }, [expenses]);
  // Default to most recent month
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return monthOptions.length > 0 ? monthOptions[0].value : "";
  });
  // Filter expenses for selected month
  const filteredExpenses = useMemo(() => {
    if (!selectedMonth) return [];
    return expenses.filter((doc) => {
      const date = new Date(doc.content.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });
  }, [expenses, selectedMonth]);
  // Calculate monthly statistics
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce(
      (sum, doc) => sum + doc.content.amount,
      0,
    );
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;
    // Category breakdown
    const categoryTotals = new Map();
    filteredExpenses.forEach((doc) => {
      const current = categoryTotals.get(doc.content.category) || 0;
      categoryTotals.set(doc.content.category, current + doc.content.amount);
    });
    // Payment method breakdown
    const paymentTotals = new Map();
    filteredExpenses.forEach((doc) => {
      const method = doc.content.paymentMethod || "Unknown";
      const current = paymentTotals.get(method) || 0;
      paymentTotals.set(method, current + doc.content.amount);
    });
    return {
      total: Math.round(total * 100) / 100,
      count,
      average: Math.round(average * 100) / 100,
      categoryTotals,
      paymentTotals,
    };
  }, [filteredExpenses]);
  // Prepare data for category chart
  const categoryChartData = useMemo(() => {
    const data = Array.from(stats.categoryTotals.entries())
      .map(([category, amount]) => ({
        name: category,
        value: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => b.value - a.value);
    return {
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };
  }, [stats.categoryTotals]);
  // Prepare data for payment method chart
  const paymentChartData = useMemo(() => {
    const data = Array.from(stats.paymentTotals.entries()).map(
      ([method, amount]) => ({
        name: method,
        value: Math.round(amount * 100) / 100,
      }),
    );
    return {
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };
  }, [stats.paymentTotals]);
  if (monthOptions.length === 0) {
    return React.createElement(
      Grid,
      null,
      React.createElement(
        Grid.Col,
        { span: { sm: 12 } },
        React.createElement(
          Tile,
          null,
          React.createElement(
            Text,
            { element: "p", color: "secondary" },
            "No expense data available.",
          ),
        ),
      ),
    );
  }
  return React.createElement(
    Grid,
    null,
    React.createElement(
      Grid.Col,
      { span: { sm: 12 } },
      React.createElement(Select, {
        value: selectedMonth,
        onChange: setSelectedMonth,
        options: monthOptions,
        label: "Select Month",
      }),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 4 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          {
            element: "h3",
            size: "lg",
            weight: "medium",
            style: { marginBottom: "0.5rem" },
          },
          "Total Expenses",
        ),
        React.createElement(
          Text,
          { element: "p", size: "xl3", weight: "bold", color: "primary" },
          "\u20AC",
          stats.total.toLocaleString(),
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary", size: "sm" },
          stats.count,
          " transactions",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 4 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          {
            element: "h3",
            size: "lg",
            weight: "medium",
            style: { marginBottom: "0.5rem" },
          },
          "Average Expense",
        ),
        React.createElement(
          Text,
          { element: "p", size: "xl3", weight: "bold", color: "primary" },
          "\u20AC",
          stats.average.toLocaleString(),
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary", size: "sm" },
          "Per transaction",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 4 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          {
            element: "h3",
            size: "lg",
            weight: "medium",
            style: { marginBottom: "0.5rem" },
          },
          "Transaction Count",
        ),
        React.createElement(
          Text,
          { element: "p", size: "xl3", weight: "bold", color: "primary" },
          stats.count,
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary", size: "sm" },
          "This month",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          {
            element: "h3",
            size: "lg",
            weight: "medium",
            style: { marginBottom: "1rem" },
          },
          "Expenses by Category",
        ),
        React.createElement(Echart, {
          option: categoryChartData,
          width: "100%",
          height: "300px",
        }),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          {
            element: "h3",
            size: "lg",
            weight: "medium",
            style: { marginBottom: "1rem" },
          },
          "Expenses by Payment Method",
        ),
        React.createElement(Echart, {
          option: paymentChartData,
          width: "100%",
          height: "300px",
        }),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          {
            element: "h3",
            size: "lg",
            weight: "medium",
            style: { marginBottom: "1rem" },
          },
          "Recent Expenses",
        ),
        React.createElement(
          Table,
          { ariaLabel: "Recent expenses" },
          React.createElement(
            Table.Header,
            null,
            React.createElement(Table.Column, { isRowHeader: true }, "Date"),
            React.createElement(Table.Column, null, "Title"),
            React.createElement(Table.Column, null, "Category"),
            React.createElement(Table.Column, { align: "right" }, "Amount"),
            React.createElement(Table.Column, null, "Payment Method"),
          ),
          React.createElement(
            Table.Body,
            null,
            filteredExpenses
              .sort(
                (a, b) =>
                  new Date(b.content.date).getTime() -
                  new Date(a.content.date).getTime(),
              )
              .slice(0, 10)
              .map((doc) =>
                React.createElement(
                  Table.Row,
                  { key: doc.id },
                  React.createElement(
                    Table.Cell,
                    null,
                    new Date(doc.content.date).toLocaleDateString(),
                  ),
                  React.createElement(Table.Cell, null, doc.content.title),
                  React.createElement(Table.Cell, null, doc.content.category),
                  React.createElement(
                    Table.Cell,
                    { align: "right" },
                    "\u20AC",
                    doc.content.amount.toLocaleString(),
                  ),
                  React.createElement(
                    Table.Cell,
                    null,
                    doc.content.paymentMethod || "Unknown",
                  ),
                ),
              ),
          ),
        ),
        filteredExpenses.length === 0 &&
          React.createElement(
            Text,
            {
              element: "p",
              color: "secondary",
              style: { textAlign: "center", padding: "2rem" },
            },
            "No expenses found for this month.",
          ),
      ),
    ),
  );
}
