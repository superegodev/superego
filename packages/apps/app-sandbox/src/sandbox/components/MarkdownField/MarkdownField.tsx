import { lazy, type ReactNode, Suspense } from "react";
import Description from "../forms/Description.js";
import Label from "../forms/Label.js";
import * as cs from "./MarkdownField.css.js";

const MarkdownInput = lazy(() => import("./MarkdownInput.js"));

interface Props {
  value: string | null;
  onChange: (newValue: string | null) => void;
  layout?: "vertical" | "horizontal" | undefined;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  placeholder?: string | undefined;
  isDisabled?: boolean | undefined;
}
export default function MarkdownField({
  value,
  onChange,
  layout = "vertical",
  label,
  ariaLabel,
  description,
  placeholder,
  isDisabled,
}: Props) {
  return (
    <div
      data-disabled={isDisabled || undefined}
      className={cs.MarkdownField.root[layout]}
    >
      {label ? <Label>{label}</Label> : null}
      <Suspense>
        <MarkdownInput
          value={value}
          onChange={(newValue) => onChange(newValue === "" ? null : newValue)}
          placeholder={placeholder}
          isDisabled={isDisabled}
          ariaLabel={ariaLabel}
        />
      </Suspense>
      {description ? <Description>{description}</Description> : null}
    </div>
  );
}
