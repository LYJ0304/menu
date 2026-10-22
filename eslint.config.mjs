import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/features/meals/types.ts",
      "src/features/meals/date.ts",
      "src/features/meals/import/**/*.ts",
      "src/features/meals/csv/**/*.ts",
      "src/features/meals/http/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/db/**",
                "drizzle-orm",
                "drizzle-orm/**",
                "**/repositories/**",
                "../repositories/**",
                "@/features/meals/server",
                "../server",
              ],
              message:
                "DB 구현은 server.ts에서 연결하고, 처리 로직과 HTTP 계층에는 인터페이스로 전달하세요.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
