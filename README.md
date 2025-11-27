# Studio1 Etalon Client

React + Ant Design client for the Studio1 OData API. Supports full CRUD for `EtProducer` and their `EtPart` items, provides a master-detail UI inspired by the legacy desktop tool, and is ready for adding new entities by reusing the shared OData client and form configs.

## Getting started

```bash
cd client
npm install
```

Create a `.env` file in `client/` (Vite automatically loads it) and set the API endpoint and token. When working against a remote instance that blocks cross-origin calls, keep `VITE_API_BASE_URL=/odata` and point the proxy to the remote host:

```
VITE_API_BASE_URL=/odata
VITE_API_TOKEN=<your_api_token>
VITE_API_PROXY_TARGET=http://studio-api.interparts.ru
```

Then run the dev server:

```bash
npm run dev
```

The app expects the Studio1 API to be available locally on the configured URL. All requests include the Authorization header automatically.

## Extending the UI

- Declare new fields in `src/config/resources.ts` to instantly get form inputs.
- Use the generic helpers from `src/api/odataClient.ts` to add new resource APIs.
- Compose new list/detail panes by following the patterns in `ProducerPanel` and `PartsPanel`.


