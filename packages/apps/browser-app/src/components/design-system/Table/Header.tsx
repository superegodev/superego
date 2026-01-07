import type { RefAttributes } from "react";
import { TableHeader, type TableHeaderProps } from "react-aria-components";

interface Props<Element extends object> extends TableHeaderProps<Element> {
  className?: string | undefined;
}
export default function Header<Element extends object>({
  className,
  ...props
}: Props<Element> & RefAttributes<HTMLTableSectionElement>) {
  return <TableHeader {...props} className={className} />;
}
