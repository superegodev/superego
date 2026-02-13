import { PiCaretLeft, PiCaretRight, PiDotsThree } from "react-icons/pi";
import { useIntl } from "react-intl";
import classnames from "../../../utils/classnames.js";
import Button from "../Button/Button.js";
import makePaginationItems from "./makePaginationItems.js";
import * as cs from "./Pagination.css.js";

interface Props {
  totalPages: number;
  activePage: number;
  onActivePageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  className?: string | undefined;
}
export default function Pagination({
  totalPages,
  activePage,
  onActivePageChange,
  pageSize,
  totalItems,
  className,
}: Props) {
  const intl = useIntl();

  if (totalPages <= 0) {
    return null;
  }

  const paginationItems = makePaginationItems(totalPages, activePage);

  const handleChange = (page: number) => {
    if (page === activePage) {
      return;
    }
    onActivePageChange(page);
  };

  return (
    <nav
      aria-label={intl.formatMessage({ defaultMessage: "Pagination" })}
      className={classnames(cs.Pagination.root, className)}
    >
      <span className={cs.Pagination.itemsInfo}>
        {intl.formatMessage(
          { defaultMessage: "{startItem}-{endItem} of {totalItems}" },
          {
            startItem: (activePage - 1) * pageSize + 1,
            endItem: Math.min(activePage * pageSize, totalItems),
            totalItems: totalItems,
          },
        )}
      </span>
      <Button
        variant="default"
        className={cs.Pagination.prevNextButton}
        onPress={() => handleChange(activePage - 1)}
        isDisabled={activePage === 1}
        aria-label={intl.formatMessage({ defaultMessage: "Previous page" })}
      >
        <PiCaretLeft aria-hidden="true" />
      </Button>
      {paginationItems.map((paginationItem) =>
        paginationItem.type === "ellipsis" ? (
          <span
            key={paginationItem.key}
            className={cs.Pagination.ellipsis}
            data-testid="design-system.Pagination.ellipsis"
          >
            <PiDotsThree aria-hidden="true" />
          </span>
        ) : (
          <Button
            key={paginationItem.page}
            variant={paginationItem.page === activePage ? "primary" : "default"}
            className={cs.Pagination.pageButton}
            onPress={() => handleChange(paginationItem.page)}
            aria-current={
              paginationItem.page === activePage ? "page" : undefined
            }
            aria-label={intl.formatMessage(
              { defaultMessage: "Page {page}" },
              { page: paginationItem.page },
            )}
          >
            {paginationItem.page}
          </Button>
        ),
      )}
      <Button
        variant="default"
        className={cs.Pagination.prevNextButton}
        onPress={() => handleChange(activePage + 1)}
        isDisabled={activePage === totalPages}
        aria-label={intl.formatMessage({ defaultMessage: "Next page" })}
      >
        <PiCaretRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
