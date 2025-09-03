import { Disclosure, DisclosurePanel } from "react-aria-components";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import Button from "../../design-system/Button/Button.js";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  title: string;
  value: object;
}
export default function JsonDetails({ title, value }: Props) {
  return (
    <Disclosure>
      {({ isExpanded }) => (
        <>
          <Button
            slot="trigger"
            variant="invisible"
            className={cs.JsonDetails.disclosureTrigger}
          >
            {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
            {title}
          </Button>
          <DisclosurePanel>
            <pre className={cs.JsonDetails.pre}>
              <code className={cs.JsonDetails.code}>
                {JSON.stringify(value, null, 2)}
              </code>
            </pre>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
