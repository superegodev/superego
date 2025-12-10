import type { CalendarDate } from "@internationalized/date";
import {
  createContext,
  type JSX,
  type ReactNode,
  type RefObject,
  useContext,
  useMemo,
  useRef,
} from "react";

interface DayContextValue {
  date: CalendarDate;
  calendarCellRef: RefObject<HTMLTableCellElement | null>;
  onUnselectDate: () => void;
  renderDayPopover?: ((day: string) => JSX.Element) | undefined;
}

const DayContext = createContext<DayContextValue | null>(null);

interface Props {
  date: CalendarDate;
  onUnselectDate: () => void;
  renderDayPopover?: ((day: string) => JSX.Element) | undefined;
  children: ReactNode;
}
export function DayProvider({
  date,
  onUnselectDate,
  renderDayPopover,
  children,
}: Props) {
  const calendarCellRef = useRef<HTMLTableCellElement>(null);
  const value = useMemo(
    () => ({
      date,
      calendarCellRef,
      onUnselectDate,
      renderDayPopover,
    }),
    [date, onUnselectDate, renderDayPopover],
  );
  return <DayContext.Provider value={value}>{children}</DayContext.Provider>;
}

export function useDay() {
  const context = useContext(DayContext);
  if (!context) {
    throw new Error("useDay must be used within a DayProvider");
  }
  return context;
}
