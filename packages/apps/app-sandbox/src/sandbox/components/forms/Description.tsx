import type { ReactNode } from "react";
import { Text } from "react-aria-components";
import * as cs from "./forms.css.js";

interface Props {
  children: ReactNode;
}
export default function Description({ children }: Props) {
  return (
    <Text className={cs.Description.root} slot="description">
      {children}
    </Text>
  );
}
