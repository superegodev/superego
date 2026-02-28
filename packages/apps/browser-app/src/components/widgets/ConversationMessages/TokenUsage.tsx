import type { Message } from "@superego/backend";
import { Button, TooltipTrigger } from "react-aria-components";
import { FormattedMessage } from "react-intl";
import formatTokenCount from "../../../utils/formatTokenCount.js";
import Tooltip from "../../design-system/Tooltip/Tooltip.js";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.ContentAssistant;
}
export default function TokenUsage({ message }: Props) {
  const { totalTokens, inputTokens, outputTokens, cost } =
    message.generationStats;
  if (totalTokens === 0) {
    return null;
  }
  return (
    <TooltipTrigger delay={300}>
      <Button slot={null} className={cs.TokenUsage.trigger}>
        <FormattedMessage
          defaultMessage="{totalTokens} tokens"
          values={{ totalTokens: formatTokenCount(totalTokens) }}
        />
      </Button>
      <Tooltip className={cs.TokenUsage.tooltip}>
        <dl className={cs.TokenUsage.statsList}>
          <dt>
            <FormattedMessage defaultMessage="Input" />
          </dt>
          <dd className={cs.TokenUsage.statsListValue}>
            {formatTokenCount(inputTokens)}
          </dd>
          <dt>
            <FormattedMessage defaultMessage="Output" />
          </dt>
          <dd className={cs.TokenUsage.statsListValue}>
            {formatTokenCount(outputTokens)}
          </dd>
          <dt>
            <FormattedMessage defaultMessage="Total" />
          </dt>
          <dd className={cs.TokenUsage.statsListValue}>
            {formatTokenCount(totalTokens)}
          </dd>
          {cost ? (
            <>
              <dt>
                <FormattedMessage defaultMessage="Cost" />
              </dt>
              <dd className={cs.TokenUsage.statsListValue}>
                {cost.toFixed(4)}
              </dd>
            </>
          ) : null}
        </dl>
      </Tooltip>
    </TooltipTrigger>
  );
}
