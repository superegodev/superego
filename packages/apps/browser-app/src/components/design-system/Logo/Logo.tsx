import { useIntl } from "react-intl";
import logo from "./logo.svg?inline";
import logoHardHat from "./logo-hard-hat.svg?inline";
import logoPixelArt from "./logo-pixel-art.svg?inline";

interface Props {
  variant: "standard" | "hard-hat" | "pixel-art";
  className?: string | undefined;
}
export default function Logo({ variant, className }: Props) {
  const intl = useIntl();
  return (
    <img
      className={className}
      src={
        variant === "hard-hat"
          ? logoHardHat
          : variant === "pixel-art"
            ? logoPixelArt
            : logo
      }
      alt={intl.formatMessage({ defaultMessage: "Superego Logo" })}
    />
  );
}
