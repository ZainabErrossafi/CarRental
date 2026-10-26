# Public API

The API-key-protected public API is available under `/api/public/v1/`.

- Human-readable documentation: `/api/public/v1/docs/`
- OpenAPI JSON: `/api/public/v1/openapi.json`
- Send the server's `PUBLIC_API_KEY` in the `X-API-Key` request header.
- Default rate limit: 60 requests per minute per API key. Set `PUBLIC_API_RATE_LIMIT` to a DRF rate string such as `120/hour` to change it.

The API key belongs in the ignored root `.env` file. Generate a strong random key with:

```sh
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Do not commit the key or put it in frontend/browser code. The public API exposes read-only brands, categories, active locations, and active FAQs. Vehicle records support `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`. Vehicle writes require valid database IDs for brand and category.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET, POST | `/api/public/v1/vehicles/` | List or create vehicles |
| GET, PUT, PATCH, DELETE | `/api/public/v1/vehicles/{id}/` | Retrieve, replace, partially update, or delete a vehicle |
| GET | `/api/public/v1/brands/` | List brands |
| GET | `/api/public/v1/categories/` | List active categories |
| GET | `/api/public/v1/locations/` | List active locations |
| GET | `/api/public/v1/faqs/` | List active FAQs |

## Example

```sh
curl -H 'X-API-Key: YOUR_API_KEY' \
  https://your-domain.example/api/public/v1/vehicles/
```

Vehicle writes use JSON with `brand_id`, `category_id`, `model`, `year`, `transmission`, `fuel`, `seats`, `doors`, and `daily_rate`. Optional keys include `home_location_id`, `feature_ids`, and `deposit`. The API supports pagination, filtering, search, and ordering on the vehicle list.
