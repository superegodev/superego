import type { LiteConversation, TextSearchResult } from "@superego/backend";
import { ListBoxItem } from "react-aria-components";
import { FormattedDate, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import MatchedText from "../MatchedText/MatchedText.js";
import * as cs from "./SearchResult.css.js";

interface Props {
  result: TextSearchResult<LiteConversation>;
}
export default function ConversationSearchResult({ result }: Props) {
  const intl = useIntl();
  const { match, matchedText } = result;
  const title =
    match.title ??
    intl.formatMessage({ defaultMessage: "Untitled conversation" });
  return (
    <ListBoxItem
      id={result.match.id}
      href={toHref({
        name: RouteName.Conversation,
        conversationId: match.id,
      })}
      textValue={title}
      className={cs.SearchResult.root}
    >
      <div className={cs.SearchResult.line1}>
        <span className={cs.SearchResult.displayNameTitle}>{title}</span>
      </div>
      <div className={cs.SearchResult.line2}>
        <FormattedDate
          value={match.createdAt}
          year="numeric"
          month="short"
          day="numeric"
        />
      </div>
      <div className={cs.SearchResult.line3}>
        <MatchedText matchedText={matchedText} />
      </div>
    </ListBoxItem>
  );
}
