# Wish Enrichment Edge Function

The `enrich-wish` Supabase Edge Function fetches basic metadata for a URL
associated with a wish. It returns the page title, site name, preview image and
favicon. The function is invoked from the client using
`supabaseClient.functions.invoke()`.

## Deployment
The function deploys automatically to the production project. Every push to the
`main` branch triggers the `deploy-edge-functions.yml` workflow, which runs
`supabase functions deploy enrich-wish` using the `SUPABASE_PROJECT_ID` and
`SUPABASE_ACCESS_TOKEN` secrets. No preview environments or version tags are
used.

## Request
```json
{
  "url": "https://example.com/product"
}
```

## Response
```json
{
  "title": "Example product",
  "site_name": "Example",
  "image": "https://example.com/preview.jpg",
  "favicon": "https://example.com/favicon.ico"
}
```

The metadata is used to prefill wish fields when creating a new wish.
