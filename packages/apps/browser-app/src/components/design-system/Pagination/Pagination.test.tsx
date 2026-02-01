import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "../../../test-utils.js";
import Pagination from "./Pagination.js";

describe("Pagination", () => {
  describe("renders all pages when totalPages <= 7", () => {
    it("case: 5 pages", () => {
      // Exercise
      render(
        <Pagination
          totalPages={5}
          activePage={3}
          onActivePageChange={vi.fn()}
          pageSize={1}
          totalItems={5}
        />,
      );

      // Verify
      expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 3")).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByLabelText("Page 4")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 5")).toBeInTheDocument();
      expect(
        screen.queryByTestId("PaginationEllipsis"),
      ).not.toBeInTheDocument();
    });

    it("case: 7 pages", () => {
      // Exercise
      render(
        <Pagination
          totalPages={7}
          activePage={5}
          onActivePageChange={vi.fn()}
          pageSize={1}
          totalItems={7}
        />,
      );

      // Verify
      for (let page = 1; page <= 7; page++) {
        expect(screen.getByLabelText(`Page ${page}`)).toBeInTheDocument();
      }
      expect(
        screen.queryByTestId("PaginationEllipsis"),
      ).not.toBeInTheDocument();
    });
  });

  describe("renders with ellipses when totalPages > 7", () => {
    it("case: active page near start (< 5) - shows first 5, ellipsis, last", () => {
      // Exercise
      render(
        <Pagination
          totalPages={15}
          activePage={3}
          onActivePageChange={vi.fn()}
          pageSize={1}
          totalItems={15}
        />,
      );

      // Verify
      expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 3")).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByLabelText("Page 4")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 5")).toBeInTheDocument();
      expect(screen.queryByLabelText("Page 6")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Page 15")).toBeInTheDocument();
      const ellipses = screen.getAllByTestId("PaginationEllipsis");
      expect(ellipses).toHaveLength(1);
    });

    it("case: active page in middle - shows first, ellipsis, siblings, ellipsis, last", () => {
      // Exercise
      render(
        <Pagination
          totalPages={15}
          activePage={8}
          onActivePageChange={vi.fn()}
          pageSize={1}
          totalItems={15}
        />,
      );

      // Verify
      expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
      expect(screen.queryByLabelText("Page 2")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Page 7")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 8")).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByLabelText("Page 9")).toBeInTheDocument();
      expect(screen.queryByLabelText("Page 10")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Page 15")).toBeInTheDocument();
      const ellipses = screen.getAllByTestId("PaginationEllipsis");
      expect(ellipses).toHaveLength(2);
    });

    it("case: active page near end (> lastPage - 4) - shows first, ellipsis, last 5", () => {
      // Exercise
      render(
        <Pagination
          totalPages={15}
          activePage={13}
          onActivePageChange={vi.fn()}
          pageSize={1}
          totalItems={15}
        />,
      );

      // Verify
      expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
      expect(screen.queryByLabelText("Page 2")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Page 11")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 12")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 13")).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByLabelText("Page 14")).toBeInTheDocument();
      expect(screen.getByLabelText("Page 15")).toBeInTheDocument();
      const ellipses = screen.getAllByTestId("PaginationEllipsis");
      expect(ellipses).toHaveLength(1);
    });
  });

  describe("disables previous and next buttons at boundaries", () => {
    it("case: first page", () => {
      // Exercise
      render(
        <Pagination
          totalPages={3}
          activePage={1}
          onActivePageChange={vi.fn()}
          pageSize={1}
          totalItems={3}
        />,
      );

      // Verify
      expect(screen.getByLabelText("Previous page")).toBeDisabled();
      expect(screen.getByLabelText("Next page")).not.toBeDisabled();
    });

    it("case: last page", () => {
      // Exercise
      render(
        <Pagination
          totalPages={3}
          activePage={3}
          onActivePageChange={vi.fn()}
          pageSize={1}
          totalItems={3}
        />,
      );

      // Verify
      expect(screen.getByLabelText("Previous page")).not.toBeDisabled();
      expect(screen.getByLabelText("Next page")).toBeDisabled();
    });
  });

  it("calls onActivePageChange with selected page", () => {
    // Setup mocks
    const onActivePageChange = vi.fn();

    // Setup SUT
    render(
      <Pagination
        totalPages={5}
        activePage={2}
        onActivePageChange={onActivePageChange}
        pageSize={1}
        totalItems={5}
      />,
    );

    // Exercise
    fireEvent.click(screen.getByLabelText("Page 3"));

    // Verify
    expect(onActivePageChange).toHaveBeenCalledWith(3);
  });

  it("renders prev/next navigation buttons", () => {
    // Exercise
    render(
      <Pagination
        totalPages={10}
        activePage={5}
        onActivePageChange={vi.fn()}
        pageSize={1}
        totalItems={10}
      />,
    );

    // Verify
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });

  it("renders items info ", () => {
    // Exercise
    render(
      <Pagination
        totalPages={5}
        activePage={2}
        onActivePageChange={vi.fn()}
        pageSize={10}
        totalItems={47}
      />,
    );

    // Verify - items info element is rendered
    const itemsInfo = document.querySelector("[class*='Pagination_itemsInfo']");
    expect(itemsInfo).toBeInTheDocument();
  });
});
