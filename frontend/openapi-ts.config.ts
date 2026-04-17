import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "./openapi.json",
  output: {
    path: "./src/client",
    clean: true,
  },
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
})

