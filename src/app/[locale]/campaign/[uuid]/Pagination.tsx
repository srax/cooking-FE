"use client";

import {
  cn,
  Link,
  Pagination,
  PaginationItemRenderProps,
  PaginationItemType,
} from "@heroui/react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  limit: number;
  total: number;
}

export default function Comp({ currentPage, limit, total }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit);

  if (!total) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };
  const renderPaginationItem = ({
    ref,
    key,
    value,
    isActive,
    onNext,
    onPrevious,
    setPage,
    className,
  }: PaginationItemRenderProps) => {
    if (value === PaginationItemType.NEXT) {
      const nextPage = Math.min(currentPage + 1, totalPages);
      return (
        <Link
          key={key}
          href={createPageUrl(nextPage)}
          className={cn(className)}
        >
          <Image
            className="rotate-180"
            src={"/images/campaign/2147227476.png"}
            alt="Next"
            width={24}
            height={24}
          />
        </Link>
      );
    }

    if (value === PaginationItemType.PREV) {
      const prevPage = Math.max(currentPage - 1, 1);
      return (
        <Link
          key={key}
          href={createPageUrl(prevPage)}
          className={cn(className)}
        >
          <Image
            src={"/images/campaign/2147227476.png"}
            alt="Previous"
            width={24}
            height={24}
          />
        </Link>
      );
    }

    if (value === PaginationItemType.DOTS) {
      return (
        <span key={key} className={className}>
          ...
        </span>
      );
    }

    // cursor is the default item
    return (
      <Link
        key={key}
        ref={ref}
        href={createPageUrl(value)}
        className={cn(
          className,
          "font-cofo",
          isActive && "underline text-[#ff8df7]"
        )}
      >
        {value}
      </Link>
    );
  };

  return (
    <Pagination
      disableCursorAnimation
      showControls
      className="gap-2"
      page={currentPage}
      radius="full"
      renderItem={renderPaginationItem}
      total={totalPages}
      variant="light"
    />
  );
}
