import { defineConfig } from "@hey-api/openapi-ts"

const config = {
  input: "./openapi.json",
  // `output` is expected to be a string path in this version of openapi-ts
  output: "./src/client",
  plugins: [
    "@hey-api/client-axios",
    {
      name: "@hey-api/sdk",
      operations: {
        strategy: "byTags",
        nesting: "operationId",
      },
    },
    {
      name: "@hey-api/schemas",
      type: "json",
    },
  ],
} as unknown as any

export default defineConfig(config)

