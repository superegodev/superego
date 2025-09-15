import { useIntl } from "react-intl";
import logo from "./logo.svg?inline";

interface Props {
  className?: string | undefined;
}
export default function Logo({ className }: Props) {
  const intl = useIntl();
  return (
    <img
      className={className}
      src={logo}
      alt={intl.formatMessage({ defaultMessage: "Superego Logo" })}
    />
  );
}
