# Amazon Product Search Edge Function

The `search-amazon` Supabase Edge Function uses Amazon's official Product
Advertising API to search for products and returns a list of basic details. It
is invoked from the client using `supabaseClient.functions.invoke()`.

## Deployment
The function deploys automatically to the production project. Every push to the
`main` branch triggers the `deploy-edge-functions.yml` workflow, which runs
`supabase functions deploy search-amazon` using the `SUPABASE_PROJECT_ID` and
`SUPABASE_ACCESS_TOKEN` secrets.

## Environment Variables

The function expects the following Amazon credentials to be set:

- `AMAZON_ACCESS_KEY`
- `AMAZON_SECRET_KEY`
- `AMAZON_PARTNER_TAG`

## Request

```json
{
  "query": "Nintendo Switch",
  "limit": 3
}
```

## Response

```json
{
  "items": [
    {
      "asin": "B0GHVJF",
      "title": "Nintendo Switch",
      "image": "https://.../image.jpg",
      "price": 299,
      "url": "https://www.amazon.com/dp/B0GHVJF"
    },
    {
      "asin": "B0ABCDEF",
      "title": "Another Product",
      "image": "https://.../image2.jpg",
      "price": 199,
      "url": "https://www.amazon.com/dp/B0ABCDEF"
    }
  ]
}
```

The response contains up to `limit` results. Fields may be `undefined` when the
information is missing from the API response.
