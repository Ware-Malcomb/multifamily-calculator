# Multi-Family Tools — Prototype

Web prototype built with **React**, **TypeScript**, **Vite**, and **Mantine**.

## Getting started

```bash
cd prototype
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`  | Run oxlint               |

## Project structure

```
src/
  components/
    layout/       # Suite shell, tool layout
    steps/        # Site, Comps, Program, Costs
  services/
    regrid/       # Regrid parcel provider + mapper (mock by default)
  hooks/          # Calculator state
  types/          # Shared TypeScript types
```

## Regrid integration (Site step)

Site parcel data is sourced from **[Regrid](https://support.regrid.com/docs/getting-started)** instead of Atlas.

### Current behavior (Phase 1)

- **Mock provider** is active by default (`MockRegridProvider`)
- Address typeahead simulates Regrid's [Typeahead API](https://support.regrid.com/docs/typeahead-api)
- Selecting a result fetches a full parcel record and maps Regrid fields → site summary
- Source badges show **Regrid** provenance

Try mock searches: `Riverside`, `Research`, `Barton`

### Enabling live API (later)

1. **Do not** put your main Regrid API token in the frontend. Use a backend proxy (Hanna) or Regrid [client tokens](https://support.regrid.com/docs/access-token-management) for typeahead-only browser calls.

2. Set `VITE_REGRID_API_BASE` to your proxy base URL (e.g. `/api/regrid`).

3. Implement `HttpRegridProvider` to call:
   - `GET /api/v2/parcels/typeahead?query=...`
   - `GET /api/v2/parcels/{ll_uuid}` (or parcel by `path`)

4. Optional Vite dev proxy in `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api/regrid': {
      target: 'https://app.regrid.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/regrid/, '/api/v2'),
    },
  },
},
```

See [Regrid API Getting Started](https://support.regrid.com/docs/getting-started-api) for auth, rate limits, and response format (GeoJSON FeatureCollection).
