import type { CSSProperties, JSX, ReactNode } from "react";

/** Shows a visual alert. */
export declare function Alert(props: {
  variant: "neutral" | "info" | "error";
  title?: string;
  /** Only use if you need to override default styles. */
  style?: CSSProperties;
  children: ReactNode;
}): JSX.Element;

export declare function Button(props: {
  /** Defines the visual style. */
  variant?: "default" | "primary" | "invisible" | "danger";
  onPress?: () => void;
  children: ReactNode;
}): JSX.Element;

/** Default app used as placeholder. Do not use. */
export declare function DefaultApp(props: { collections: any }): JSX.Element;

/** Renders a chart using the echarts library. */
export declare function Echart(props: {
  /**
   * The echarts option object. For best visual results:
   * - Set:
   *   - `tooltip:{trigger:"axis",axisPointer:{type:"cross"}}`
   *   - `xAxis.type = "time"` if there are timestamps on the x axis.
   *   - `grid = {left:0,right:0,top:0,bottom:0}`
   *   - `xAxis.name = undefined`
   *   - `yAxis.name = undefined`
   *   - `legend = undefined`
   * - For numeric axes, narrow them to:
   *   - if minValue < 0 -> [minValue - 5%, maxValue + 5%] (rounded)
   *   - if minValue >= 0 -> [Math.max(0, minValue - 5%), maxValue + 5%] (rounded)
   * - In datasets and series, round all numeric values to 2 decimals. Use
   *   `Math.round(value * 100)/100)`
   * - Don't specify colors, use the default theme.
   * - If you must specify colors, prefer using this palette:
   *    - Background color: #fdfdfd
   *   - Series colors:
   *     - #228be6
   *     - #40c057
   *     - #fab005
   *     - #fa5252
   *     - #15aabf
   *     - #12b886
   *     - #fd7e14
   *     - #7950f2
   *     - #e64980
   */
  option: EChartsOption;
  /** You should usually set this to 100%. */
  width: string;
  height: string;
}): JSX.Element;

/**
 * A simple 12-column responsive grid container.
 *
 * Use this as a wrapper around one or more `Grid.Col` children. The container
 * establishes the grid context; each column decides how many of the 12 tracks
 * it spans at different breakpoints.
 *
 * Grids should usually be the outermost components of the app.
 *
 * @example
 * // Two columns on desktop, stacked on small screens
 * <Grid>
 *   <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>Left</Grid.Col>
 *   <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>Right</Grid.Col>
 * </Grid>
 */
export declare function Grid(props: { children: ReactNode }): JSX.Element;
export declare namespace Grid {
  type SpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /**
   * A responsive column within the 12-column grid. Provide how many columns the
   * child should span at each breakpoint.
   *
   * If a value is omitted for a breakpoint, it inherits from the next defined
   * smaller breakpoint (or falls back to the library’s default behavior).
   */
  var Col: (props: {
    span: {
      sm?: SpanValue;
      md?: SpanValue;
      lg?: SpanValue;
    };
    children: ReactNode;
  }) => JSX.Element;
}

export declare function PlainDatePicker(props: {
  /**
   * A calendar date in the ISO8601 format, with no time and no time offset.
   * @example
   * "2025-10-27"
   */
  value: string | null;
  onChange: (newValue: string | null) => void;
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}): JSX.Element;

/**
 * A table.
 *
 * @example
 * // Non-empty table
 * <Table ariaLabel="People">
 *   <Table.Header>
 *     <Table.Column isRowHeader>Name</Table.Column>
 *     <Table.Column>Age</Table.Column>
 *   </Table.Header>
 *   <Table.Body>
 *     <Table.Cell>John</Table.Column>
 *     <Table.Cell>35</Table.Column>
 *   </Table.Body>
 * </Table>
 */
export declare function Table(props: {
  ariaLabel: string;
  children: ReactNode;
}): JSX.Element;
export declare namespace Table {
  var Header: (props: { children: ReactNode }) => JSX.Element;
  var Column: (props: {
    /** Whether a column is a row header (for a11y). */
    isRowHeader?: boolean;
    /** Defaults to left. */
    align?: "left" | "center" | "right";
    children: ReactNode;
  }) => JSX.Element;
  var Body: (props: { children: ReactNode }) => JSX.Element;
  var Row: (props: { children: ReactNode }) => JSX.Element;
  var Cell: (props: {
    /** Defaults to left. */
    align?: "left" | "center" | "right";
    children: ReactNode;
  }) => JSX.Element;
}

/** Typography component for consistent text styling. */
export declare function Text(props: {
  /** Defaults to span. */
  element?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Defaults to primary. */
  color?: "primary" | "secondary";
  /** Defaults to sm. */
  size?: "xs2" | "xs" | "sm" | "md" | "lg" | "xl" | "xl2" | "xl3" | "xl4";
  /** Defaults to regular. */
  weight?: "light" | "regular" | "medium" | "semibold" | "bold";
  /** Defaults to sans-serif. */
  font?: "sansSerif" | "serif" | "monospace";
  /**
   * Prefer to use specific properties. Use when you need more control over
   * styling.
   */
  style?: CSSProperties;
  children: ReactNode;
}): JSX.Element;

/**
 * A minimal, unopinionated visual surface for a single dashboard element. Use
 * it when you need lightweight chrome (padding, background, border) without
 * imposing structure (no header/body/footer) or layout semantics.
 */
export declare function Tile(props: { children: ReactNode }): JSX.Element;
