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
  /** @defaultValue "md" */
  size?: "sm" | "md" | "lg";
  /** @defaultValue false */
  fullWidth?: boolean;
  onPress?: () => void;
  children: ReactNode;
}): JSX.Element;

export declare function IconButton(props: {
  /** Defines the visual style. */
  variant?: "default" | "primary" | "invisible" | undefined;
  shape?: "square" | "circle" | undefined;
  /** @defaultValue "md" */
  size?: "sm" | "md" | "lg";
  icon:
    | "caret-up"
    | "caret-down"
    | "caret-left"
    | "caret-right"
    | "check"
    | "plus"
    | "minus"
    | "x";
  /** Label for the button, shown in a tooltip. */
  label: string;
  onPress?: () => void;
}): JSX.Element;

/** Checkbox-style toggle. */
export declare function ToggleButton(props: {
  /**
   * Base hex color used to derive the component’s state palette (e.g.,
   * unselected/selected backgrounds, hover, focus).
   */
  color?: `#${string}`;
  /** @defaultValue "md */
  size?: "sm" | "md" | "lg";
  /** @defaultValue false */
  fullWidth?: boolean;
  /** Controlled value. */
  value: boolean;
  onChange: (newValue: boolean) => void;
  children: ReactNode;
}): JSX.Element;

/** Link (anchor element). Always use Link instead of <a>. */
export declare function Link(props: {
  href: string;
  target?: string;
  style?: CSSProperties;
  children: ReactNode;
}): JSX.Element;

/** Link (anchor element) styled as a Button. */
export declare function ButtonLink(props: {
  /** Defines the visual style. */
  variant?: "default" | "primary" | "invisible";
  /** @defaultValue "md" */
  size?: "sm" | "md" | "lg";
  href: string;
  target?: string;
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
   * - For heatmaps, prefer \`visualMap.type = piecewise\`.
   * - Prefer column charts over line charts for discrete time series data.
   * - Don't specify colors unless needed to disambiguate. In which case, prefer
   *   using these series colors:
   *   - `theme.colors.blues._4`
   *   - `theme.colors.greens._4`
   *   - `theme.colors.yellows._4`
   *   - `theme.colors.reds._4`
   *   - `theme.colors.cyans._4`
   *   - `theme.colors.teals._4`
   *   - `theme.colors.oranges._4`
   *   - `theme.colors.violets._4`
   *   - `theme.colors.pinks._4`
   */
  option: EChartsOption;
  /** You should usually set this to 100%. */
  width: string;
  height: string;
}): JSX.Element;

/**
 * A simple 12-column responsive grid container with good default visual
 * separation between inner `Gird.Col`s.
 *
 * Use this as a wrapper around one or more `Grid.Col` children. The container
 * establishes the grid context; each column decides how many of the 12 tracks
 * it spans at different breakpoints.
 *
 * The App should have a single `Grid` as its root component.
 *
 * @example
 * ```ts
 * <Grid>
 *   <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>Left</Grid.Col>
 *   <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>Right</Grid.Col>
 * </Grid>
 * ```
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

/** Renders an image FileRef. */
export declare function Image(props: {
  image: FileRef & { mimeType: `image/${string}` };
  style?: CSSProperties;
}): JSX.Element;

export declare function PlainDatePicker(props: {
  /**
   * Controlled value for the picker: an ISO 8601 date (YYYY-MM-DD). Set to
   * `null` when no date is selected.
   */
  value: string | null;
  onChange: (
    /**
     * New value selected by the user, or `null` if the selection was cleared.
     */
    newValue: string | null,
  ) => void;
  label?: ReactNode;
  /** Required if label is not supplied. */
  ariaLabel?: string;
  description?: ReactNode;
  isDisabled?: boolean;
}): JSX.Element;

export declare function Select(props: {
  /** Controlled value for the select. Must match an option's `value`. */
  value: string;
  onChange: (
    /** New value selected by the user. */
    newValue: string,
  ) => void;
  /** Available choices. Each `value` must be unique. */
  options: {
    /** Unique option identifier. Returned from `onChange`. */
    value: string;
    label: ReactNode;
    description?: ReactNode;
  }[];
  label?: ReactNode;
  /** Required if label is not supplied. */
  ariaLabel?: string;
  description?: ReactNode;
  isDisabled?: boolean;
}): JSX.Element;

export declare function TextField(props: {
  /** Controlled value for the input. Use `null` to represent empty. */
  value: string | null;
  onChange: (
    /** New value typed by the user, or `null` if the field is empty. */
    newValue: string | null,
  ) => void;
  label?: ReactNode;
  /** Required if label is not supplied. */
  ariaLabel?: string;
  description?: ReactNode;
  placeholder?: string;
  isDisabled?: boolean;
}): JSX.Element;

export declare function NumberField(props: {
  /** Controlled value for the input. Use `null` to represent empty. */
  value: number | null;
  onChange: (
    /** New value typed by the user, or `null` if the field is empty. */
    newValue: number | null,
  ) => void;
  label?: ReactNode;
  /** Required if label is not supplied. */
  ariaLabel?: string;
  description?: ReactNode;
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  isDisabled?: boolean;
}): JSX.Element;

export declare function RadioGroup(props: {
  /** Controlled value for the selected option. Must match an option's `value`. */
  value: string;
  onChange: (
    /** New value selected by the user. */
    newValue: string,
  ) => void;
  /** Available choices. Each `value` must be unique. */
  options: {
    /** Unique option identifier. Returned from `onChange`. */
    value: string;
    label: ReactNode;
    description?: ReactNode;
  }[];
  label?: ReactNode;
  /** Required if label is not supplied. */
  ariaLabel?: string;
  description?: ReactNode;
  isDisabled?: boolean;
}): JSX.Element;

/** Full-page calendar. NEVER put inside Tile or Grid. */
export declare function SimpleMonthCalendar(props: {
  /**
   * Renders the cell for the given day. Must return a
   * `<SimpleMonthCalendar.DayCell />`. When `renderDayPopover` is set,
   * `DayCell` should not contain interactive elements (e.g., buttons).
   */
  renderDayCell(day: string): JSX.Element;
  /**
   * Renders a popover that opens when the user clicks on a day cell. Must
   * return a `<SimpleMonthCalendar.DayPopover />`.
   */
  renderDayPopover?: (day: string) => JSX.Element;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
}): JSX.Element;
export declare namespace SimpleMonthCalendar {
  var DayCell: (props: {
    /** Leaving undefined results in an acceptable default. */
    style?: {
      backgroundColor?: string;
      borderColor?: string;
      borderStyle?: string;
      color?: string;
    };
    /** NEVER include the day number. It's already rendered. */
    children: ReactNode;
  }) => JSX.Element;
  var DayPopover: (props: {
    /**
     * Set to `false` to avoid accidental closures. For example, it should be
     * set to `false` if there's a dirty form inside the popover.
     * @defaultValue true
     */
    shouldCloseOnInteractOutside?: boolean;
    /** NEVER include a header with the day or a close/cancel button. It's already rendered. */
    children: ReactNode;
  }) => JSX.Element;
}

/**
 * A table.
 *
 * @example
 * ```ts
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
 * ```
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
    /** @defaultValue "left" */
    align?: "left" | "center" | "right";
    children: ReactNode;
  }) => JSX.Element;
  var Body: (props: { children: ReactNode }) => JSX.Element;
  var Row: (props: { children: ReactNode }) => JSX.Element;
  var Cell: (props: {
    /** @defaultValue "left" */
    align?: "left" | "center" | "right";
    children: ReactNode;
  }) => JSX.Element;
}

/** Typography component for consistent text styling. */
export declare function Text(props: {
  /**
   * Note: `span` is inline text without line breaks.
   * @defaultValue "span"
   */
  element?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** @defaultValue "primary" */
  color?: "primary" | "secondary";
  /** @defaultValue "md" */
  size?: "xs2" | "xs" | "sm" | "md" | "lg" | "xl" | "xl2" | "xl3" | "xl4";
  /** @defaultValue "regular" */
  weight?: "light" | "regular" | "medium" | "semibold" | "bold";
  /** @defaultValue "sansSerif" */
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
export declare function Tile(props: {
  style?: CSSProperties;
  children: ReactNode;
}): JSX.Element;
