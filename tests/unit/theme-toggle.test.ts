import { afterEach, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({ useTheme: vi.fn() }));

import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

afterEach(() => vi.clearAllMocks());

it.each([
  ["light", "dark"],
  ["dark", "light"],
  [undefined, "dark"],
] as const)(
  "toggles from %s without depending on server-side browser state",
  (resolvedTheme, nextTheme) => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme,
      setTheme,
      themes: ["light", "dark"],
    });
    const button = ThemeToggle();

    expect(button.props.type).toBe("button");
    button.props.onClick();
    expect(setTheme).toHaveBeenCalledWith(nextTheme);
  },
);
