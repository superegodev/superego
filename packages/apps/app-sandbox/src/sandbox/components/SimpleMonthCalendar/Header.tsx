import { Heading, Toolbar } from "react-aria-components";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import Button from "../Button/Button.js";
import IconButton from "../IconButton/IconButton.js";
import * as cs from "./SimpleMonthCalendar.css.js";

interface Props {
  onResetFocus: () => void;
}
export default function Header({ onResetFocus }: Props) {
  const {
    todayButton: today,
    previousMonthButton: previous,
    nextMonthButton: next,
  } = useIntlMessages("SimpleMonthCalendar");
  return (
    <header className={cs.Header.root}>
      <div className={cs.Header.leftSection}>
        <Toolbar className={cs.Header.toolbar}>
          <Button slot={null} variant="invisible" onPress={onResetFocus}>
            {today}
          </Button>
          <IconButton
            icon="caret-left"
            slot="previous"
            variant="invisible"
            shape="circle"
            label={previous}
          />
          <IconButton
            icon="caret-right"
            slot="next"
            variant="invisible"
            shape="circle"
            label={next}
          />
        </Toolbar>
      </div>
      <div className={cs.Header.centerSection}>
        <Heading className={cs.Header.heading} />
      </div>
      <div className={cs.Header.rightSection} />
    </header>
  );
}
