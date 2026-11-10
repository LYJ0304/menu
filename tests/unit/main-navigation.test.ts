import { afterEach, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

import { usePathname } from "next/navigation";
import { MainNavigation } from "@/components/main-navigation";

afterEach(() => vi.clearAllMocks());

it.each(["/", "/countdown", "/schedule", "/unknown"])(
  "links to all screens and marks only the current route at %s",
  (pathname) => {
    vi.mocked(usePathname).mockReturnValue(pathname);
    const navigation = MainNavigation();
    expect(navigation.props["aria-label"]).toBe("메인 메뉴");
    const links = navigation.props.children as ReactElement<{
      href: string;
      children: string;
      "aria-current"?: string;
    }>[];
    expect(links.map((link) => [link.props.href, link.props.children])).toEqual(
      [
        ["/", "식단표"],
        ["/countdown", "카운트다운"],
        ["/schedule", "일정"],
      ],
    );
    for (const link of links) {
      expect(link.props["aria-current"]).toBe(
        link.props.href === pathname ? "page" : undefined,
      );
    }
  },
);
