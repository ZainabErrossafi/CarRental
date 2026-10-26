from django.http import HttpResponse, JsonResponse


_success = {'description': 'Successful response'}
_auth_error = {'description': 'Missing or invalid API key'}
_rate_error = {'description': 'Rate limit exceeded'}


def _operation(summary, *, responses=None, request_body=None, parameters=None, tags=None):
    operation = {
        'summary': summary,
        'tags': tags or ['Catalog'],
        'responses': responses or {'200': _success, '401': _auth_error, '429': _rate_error},
    }
    if request_body:
        operation['requestBody'] = request_body
    if parameters:
        operation['parameters'] = parameters
    return operation


_vehicle_body = {
    'required': True,
    'content': {
        'application/json': {
            'schema': {
                'type': 'object',
                'required': ['brand_id', 'category_id', 'model', 'year', 'transmission', 'fuel', 'seats', 'doors', 'daily_rate'],
                'properties': {
                    'brand_id': {'type': 'integer', 'example': 1},
                    'category_id': {'type': 'integer', 'example': 1},
                    'home_location_id': {'type': 'integer', 'nullable': True, 'example': 1},
                    'feature_ids': {'type': 'array', 'items': {'type': 'integer'}},
                    'model': {'type': 'string', 'example': 'RAV4'},
                    'year': {'type': 'integer', 'example': 2025},
                    'transmission': {'type': 'string', 'enum': ['manual', 'automatic']},
                    'fuel': {'type': 'string', 'enum': ['petrol', 'diesel', 'hybrid', 'electric']},
                    'seats': {'type': 'integer', 'example': 5},
                    'doors': {'type': 'integer', 'example': 4},
                    'daily_rate': {'type': 'number', 'example': '450.00'},
                    'deposit': {'type': 'number', 'example': '2000.00'},
                    'status': {'type': 'string', 'enum': ['available', 'maintenance', 'hidden']},
                },
            },
        },
    },
}

_id_parameter = [{
    'name': 'id', 'in': 'path', 'required': True,
    'schema': {'type': 'integer'}, 'description': 'Database ID of the vehicle.',
}]

OPENAPI_SCHEMA = {
    'openapi': '3.0.3',
    'info': {
        'title': 'Rently Public API',
        'version': '1.0.0',
        'description': 'API-key-protected access to Rently vehicle and catalog data.',
    },
    'servers': [{'url': '/api/public/v1'}],
    'security': [{'ApiKeyAuth': []}],
    'components': {
        'securitySchemes': {
            'ApiKeyAuth': {'type': 'apiKey', 'in': 'header', 'name': 'X-API-Key'},
        },
    },
    'paths': {
        '/vehicles/': {
            'get': _operation('List vehicles', tags=['Vehicles'], responses={'200': _success, '401': _auth_error, '429': _rate_error}),
            'post': _operation('Create a vehicle', tags=['Vehicles'], request_body=_vehicle_body, responses={'201': {'description': 'Vehicle created'}, '400': {'description': 'Invalid vehicle data'}, '401': _auth_error, '429': _rate_error}),
        },
        '/vehicles/{id}/': {
            'get': _operation('Get a vehicle', tags=['Vehicles'], parameters=_id_parameter, responses={'200': _success, '401': _auth_error, '404': {'description': 'Vehicle not found'}, '429': _rate_error}),
            'put': _operation('Replace a vehicle', tags=['Vehicles'], parameters=_id_parameter, request_body=_vehicle_body, responses={'200': _success, '400': {'description': 'Invalid vehicle data'}, '401': _auth_error, '404': {'description': 'Vehicle not found'}, '429': _rate_error}),
            'patch': _operation('Partially update a vehicle', tags=['Vehicles'], parameters=_id_parameter, request_body=_vehicle_body, responses={'200': _success, '400': {'description': 'Invalid vehicle data'}, '401': _auth_error, '404': {'description': 'Vehicle not found'}, '429': _rate_error}),
            'delete': _operation('Delete a vehicle', tags=['Vehicles'], parameters=_id_parameter, responses={'204': {'description': 'Vehicle deleted'}, '401': _auth_error, '404': {'description': 'Vehicle not found'}, '429': _rate_error}),
        },
        '/brands/': {'get': _operation('List brands', tags=['Catalog'])},
        '/categories/': {'get': _operation('List active categories', tags=['Catalog'])},
        '/locations/': {'get': _operation('List active locations', tags=['Catalog'])},
        '/faqs/': {'get': _operation('List published FAQs', tags=['Catalog'])},
    },
}


def openapi_schema(request):
    return JsonResponse(OPENAPI_SCHEMA)


def public_api_docs(request):
    return HttpResponse(
        '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rently Public API</title>
<style>
body{margin:0;background:#fdfaf5;color:#021731;font:15px/1.65 Arial,sans-serif}main{max-width:940px;margin:40px auto;padding:0 20px}.brand{font-size:28px;font-weight:800}.brand span{color:#f5b577}h1{margin:12px 0 4px}h2{margin-top:34px}p,.muted{color:#67574e}code,pre{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}code{background:#fff1e7;padding:2px 5px;border-radius:4px}.panel{background:white;border:1px solid #e8e2de;border-radius:14px;padding:18px;margin:14px 0}table{width:100%;border-collapse:collapse;background:white}th,td{text-align:left;padding:11px;border-bottom:1px solid #e8e2de}th{background:#021731;color:white}.method{font-weight:bold;color:#a34d16}pre{overflow:auto;background:#021731;color:#fff1e7;padding:16px;border-radius:10px}.link{color:#a34d16;font-weight:bold}
</style></head><body><main>
<div class="brand">Rently<span>.</span></div><h1>Public API documentation</h1>
<p>Version 1.0.0 · JSON REST API · Base URL <code>/api/public/v1/</code></p>
<div class="panel"><strong>Authentication</strong><p>Send your API key on every API request in the <code>X-API-Key</code> header. The API key is configured by the server owner as the <code>PUBLIC_API_KEY</code> environment variable. Do not put the key in public browser code or commit it to source control.</p>
<pre>curl -H 'X-API-Key: YOUR_API_KEY' \\
  https://your-domain.example/api/public/v1/vehicles/</pre>
<strong>Rate limit:</strong> 60 requests per minute per API key by default. Configure <code>PUBLIC_API_RATE_LIMIT</code> to change it. Requests over the limit return HTTP 429.
</div>
<h2>Endpoints</h2><table><thead><tr><th>Method</th><th>Path</th><th>Purpose</th></tr></thead><tbody>
<tr><td class="method">GET</td><td><code>/vehicles/</code></td><td>List vehicles; supports pagination, filters, search, and ordering.</td></tr>
<tr><td class="method">POST</td><td><code>/vehicles/</code></td><td>Create a vehicle.</td></tr>
<tr><td class="method">GET</td><td><code>/vehicles/{id}/</code></td><td>Retrieve a vehicle.</td></tr>
<tr><td class="method">PUT / PATCH</td><td><code>/vehicles/{id}/</code></td><td>Replace or partially update a vehicle.</td></tr>
<tr><td class="method">DELETE</td><td><code>/vehicles/{id}/</code></td><td>Delete a vehicle.</td></tr>
<tr><td class="method">GET</td><td><code>/brands/</code>, <code>/categories/</code>, <code>/locations/</code>, <code>/faqs/</code></td><td>Read catalog data and active FAQs.</td></tr>
</tbody></table>
<h2>Create or update a vehicle</h2><p>Send JSON with database IDs for its brand and category. The key <code>feature_ids</code> is an optional list of feature IDs.</p>
<pre>{
  "brand_id": 1,
  "category_id": 2,
  "home_location_id": 1,
  "feature_ids": [1, 3],
  "model": "RAV4",
  "year": 2025,
  "transmission": "automatic",
  "fuel": "hybrid",
  "seats": 5,
  "doors": 4,
  "daily_rate": "450.00",
  "deposit": "2000.00"
}</pre>
<p>Vehicle list responses are paginated. Common query parameters include <code>brand</code>, <code>category</code>, <code>status</code>, <code>fuel</code>, <code>transmission</code>, <code>search</code>, <code>ordering</code>, and <code>page</code>.</p>
<p>Responses: <code>401</code> missing/invalid key, <code>400</code> invalid input, <code>404</code> missing record, <code>429</code> rate limit exceeded.</p>
<p>Machine-readable OpenAPI specification: <a class="link" href="/api/public/v1/openapi.json">/api/public/v1/openapi.json</a></p>
</main></body></html>''',
        content_type='text/html; charset=utf-8',
    )
