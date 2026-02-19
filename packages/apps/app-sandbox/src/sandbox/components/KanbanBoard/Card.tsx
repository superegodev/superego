import { type PointerEvent, type ReactNode, useCallback } from "react";
import type { Key } from "react-aria-components";
import { Button, GridListItem } from "react-aria-components";
import { PiDotsSixVertical } from "react-icons/pi";
import useNavigateHostTo from "../../business-logic/host-navigation/useNavigateHostTo.js";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import * as cs from "./KanbanBoard.css.js";

const INTERACTIVE_SELECTOR =
  "input, button, a, select, textarea, [contenteditable], [role='button'], [role='link']";

interface Props {
  id: Key;
  textValue: string;
  href?: string;
  children: ReactNode;
}
export default function Card({ id, textValue, href, children }: Props) {
  const { dragButton } = useIntlMessages("KanbanBoard");
  const navigateHostTo = useNavigateHostTo();

  // RAC components (Button, IconButton, etc) already stop pointer-event
  // propagation via usePress, so they never trigger the parent's onAction.
  // Plain HTML interactive elements don't. We stop propagation so they don't
  // accidentally trigger navigation.
  const stopPropagationFromInteractive = useCallback((evt: PointerEvent) => {
    const target = evt.target as HTMLElement;
    if (
      target !== evt.currentTarget &&
      target.closest?.(INTERACTIVE_SELECTOR)
    ) {
      evt.stopPropagation();
    }
  }, []);

  return (
    <GridListItem
      id={id}
      textValue={textValue}
      className={cs.Card.root}
      onAction={href ? () => navigateHostTo(href) : undefined}
      style={href ? { cursor: "pointer" } : undefined}
    >
      <Button
        slot="drag"
        className={cs.Card.dragHandle}
        aria-label={dragButton}
      >
        <PiDotsSixVertical />
      </Button>
      <div
        className={cs.Card.content}
        onPointerDown={href ? stopPropagationFromInteractive : undefined}
      >
        {children}
      </div>
    </GridListItem>
  );
}
