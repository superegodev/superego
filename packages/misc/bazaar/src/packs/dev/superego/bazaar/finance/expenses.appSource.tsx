import {
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
    ProtoCollection_0: {
      id: "ProtoCollection_0";
      displayName: string;
      documents: {
        id: `Document_${string}`;
        content: ProtoCollection_0.Expense;
      }[];
    };
  };
}

export default function App(props: Props): React.ReactElement | null {
  const expenses = props.collections.ProtoCollection_0.documents;

  // Get unique months from expenses
  const monthOptions = React.useMemo(() => {
    const months = new Set<string>();
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
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    return monthOptions.length > 0 ? monthOptions[0].value : "";
  });

  // Filter expenses for selected month
  const filteredExpenses = React.useMemo(() => {
    if (!selectedMonth) return [];
    return expenses.filter((doc) => {
      const date = new Date(doc.content.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  // Calculate monthly statistics
  const stats = React.useMemo(() => {
    const total = filteredExpenses.reduce(
      (sum, doc) => sum + doc.content.amount,
      0,
    );
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    // Category breakdown
    const categoryTotals = new Map<string, number>();
    filteredExpenses.forEach((doc) => {
      const current = categoryTotals.get(doc.content.category) || 0;
      categoryTotals.set(doc.content.category, current + doc.content.amount);
    });

    // Payment method breakdown
    const paymentTotals = new Map<string, number>();
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
  const categoryChartData = React.useMemo(() => {
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
  const paymentChartData = React.useMemo(() => {
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
    return (
      <Grid>
        <Grid.Col span={{ sm: 12 }}>
          <Tile>
            <Text element="p" color="secondary">
              No expense data available.
            </Text>
          </Tile>
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <Grid>
      <Grid.Col span={{ sm: 12 }}>
        <Select
          value={selectedMonth}
          onChange={setSelectedMonth}
          options={monthOptions}
          label="Select Month"
        />
      </Grid.Col>

      <Grid.Col span={{ sm: 12, md: 4 }}>
        <Tile>
          <Text
            element="h3"
            size="lg"
            weight="medium"
            style={{ marginBottom: "0.5rem" }}
          >
            Total Expenses
          </Text>
          <Text element="p" size="xl3" weight="bold" color="primary">
            €{stats.total.toLocaleString()}
          </Text>
          <Text element="p" color="secondary" size="sm">
            {stats.count} transactions
          </Text>
        </Tile>
      </Grid.Col>

      <Grid.Col span={{ sm: 12, md: 4 }}>
        <Tile>
          <Text
            element="h3"
            size="lg"
            weight="medium"
            style={{ marginBottom: "0.5rem" }}
          >
            Average Expense
          </Text>
          <Text element="p" size="xl3" weight="bold" color="primary">
            €{stats.average.toLocaleString()}
          </Text>
          <Text element="p" color="secondary" size="sm">
            Per transaction
          </Text>
        </Tile>
      </Grid.Col>

      <Grid.Col span={{ sm: 12, md: 4 }}>
        <Tile>
          <Text
            element="h3"
            size="lg"
            weight="medium"
            style={{ marginBottom: "0.5rem" }}
          >
            Transaction Count
          </Text>
          <Text element="p" size="xl3" weight="bold" color="primary">
            {stats.count}
          </Text>
          <Text element="p" color="secondary" size="sm">
            This month
          </Text>
        </Tile>
      </Grid.Col>

      <Grid.Col span={{ sm: 12, md: 6 }}>
        <Tile>
          <Text
            element="h3"
            size="lg"
            weight="medium"
            style={{ marginBottom: "1rem" }}
          >
            Expenses by Category
          </Text>
          <Echart option={categoryChartData} width="100%" height="300px" />
        </Tile>
      </Grid.Col>

      <Grid.Col span={{ sm: 12, md: 6 }}>
        <Tile>
          <Text
            element="h3"
            size="lg"
            weight="medium"
            style={{ marginBottom: "1rem" }}
          >
            Expenses by Payment Method
          </Text>
          <Echart option={paymentChartData} width="100%" height="300px" />
        </Tile>
      </Grid.Col>

      <Grid.Col span={{ sm: 12 }}>
        <Tile>
          <Text
            element="h3"
            size="lg"
            weight="medium"
            style={{ marginBottom: "1rem" }}
          >
            Recent Expenses
          </Text>
          <Table ariaLabel="Recent expenses">
            <Table.Header>
              <Table.Column isRowHeader>Date</Table.Column>
              <Table.Column>Title</Table.Column>
              <Table.Column>Category</Table.Column>
              <Table.Column align="right">Amount</Table.Column>
              <Table.Column>Payment Method</Table.Column>
            </Table.Header>
            <Table.Body>
              {filteredExpenses
                .sort(
                  (a, b) =>
                    new Date(b.content.date).getTime() -
                    new Date(a.content.date).getTime(),
                )
                .slice(0, 10)
                .map((doc) => (
                  <Table.Row key={doc.id}>
                    <Table.Cell>
                      {new Date(doc.content.date).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>{doc.content.title}</Table.Cell>
                    <Table.Cell>{doc.content.category}</Table.Cell>
                    <Table.Cell align="right">
                      €{doc.content.amount.toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      {doc.content.paymentMethod || "Unknown"}
                    </Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
          {filteredExpenses.length === 0 && (
            <Text
              element="p"
              color="secondary"
              style={{ textAlign: "center", padding: "2rem" }}
            >
              No expenses found for this month.
            </Text>
          )}
        </Tile>
      </Grid.Col>
    </Grid>
  );
}
