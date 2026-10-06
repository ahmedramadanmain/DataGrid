"use client";

import { Pagination as HeroPagination } from "@heroui/react";
import SelectBox from "../SelectBox/SelectBox";

interface IPaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;

  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;

  totalItems: number;
  totalPages: number;

  startItem: number;
  endItem: number;
}

const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"];

const Pagination = ({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalItems,
  totalPages,
  startItem,
  endItem,
}: IPaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 4) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 3) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col gap-4 border-t border-default-200/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Summary */}
      <p className="text-sm text-default-500 gap-2 flex">
       
        <span className="font-medium text-foreground">
          {startItem}-{endItem}
        </span>
        of <span className="font-medium text-foreground">{totalItems}</span>
        results
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Page Size */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-default-500">
            Rows per page
          </span>

          <SelectBox
            name=""
            items={PAGE_SIZE_OPTIONS}
            showAll={false}
            value={String(pageSize)}
            onChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          />
        </div>

        {/* Pagination */}
        <HeroPagination size="sm">
          <HeroPagination.Content>
            {/* Previous */}
            <HeroPagination.Item>
              <HeroPagination.Previous
                isDisabled={page === 1}
                onPress={() =>
                  setPage((currentPage) => Math.max(1, currentPage - 1))
                }
              >
                <HeroPagination.PreviousIcon />
                <span>Previous</span>
              </HeroPagination.Previous>
            </HeroPagination.Item>

            {/* Pages */}
            {getPageNumbers().map((item, index) =>
              item === "ellipsis" ? (
                <HeroPagination.Item key={`ellipsis-${index}`}>
                  <HeroPagination.Ellipsis />
                </HeroPagination.Item>
              ) : (
                <HeroPagination.Item key={item}>
                  <HeroPagination.Link
                    isActive={item === page}
                    onPress={() => setPage(item)}
                  >
                    {item}
                  </HeroPagination.Link>
                </HeroPagination.Item>
              ),
            )}

            {/* Next */}
            <HeroPagination.Item>
              <HeroPagination.Next
                isDisabled={page === totalPages}
                onPress={() =>
                  setPage((currentPage) =>
                    Math.min(totalPages, currentPage + 1),
                  )
                }
              >
                <span>Next</span>
                <HeroPagination.NextIcon />
              </HeroPagination.Next>
            </HeroPagination.Item>
          </HeroPagination.Content>
        </HeroPagination>
      </div>
    </div>
  );
};

export default Pagination;
