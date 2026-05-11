---
name: backend_endpoint_tester
description: >
  Testea automáticamente endpoints de un backend HTTP (FastAPI, Flask, Express, etc.)
  ejecutando requests reales y validando códigos de estado, estructura de respuesta y
  tiempos de respuesta. Úsala siempre que el usuario quiera verificar si un backend
  funciona correctamente, debuggear endpoints, validar una API antes de un deploy,
  o correr smoke tests post-deploy. También triggerear cuando el usuario menciona
  frases como "verificar endpoints", "probar la API", "testear el backend",
  "validar rutas", "chequear si el server anda", o pide un "health check" de servicios.
  Combina bien con skills de autenticación, base de datos o CI/CD.
---

# Skill: Backend Endpoint Tester

Ejecuta requests HTTP sobre una lista de endpoints y valida su comportamiento.
Soporta todos los métodos HTTP, headers personalizados, autenticación, validación
de schema JSON y retry automático.

---

## Inputs del Orquestador

| Parámetro      | Tipo    | Requerido | Default | Descripción                                      |
|----------------|---------|-----------|---------|--------------------------------------------------|
| `base_url`     | string  | ✅        | —       | URL base del backend (ej: `http://localhost:8000`) |
| `endpoints`    | array   | ✅        | —       | Lista de endpoints a testear (ver formato abajo) |
| `timeout`      | number  | ❌        | 5       | Segundos máximos por request                     |
| `global_headers` | object | ❌       | {}      | Headers aplicados a todos los requests (ej: Authorization) |
| `stop_on_failure` | bool | ❌       | false   | Detener la ejecución al primer fallo             |
| `retry`        | object  | ❌        | —       | Config de retry (ver sección Retry)              |

### Formato de cada endpoint

```json
{
  "method": "POST",
  "path": "/productos",
  "body": { "nombre": "test", "precio": 100 },
  "headers": { "X-Custom": "valor" },
  "expected_status": 201,
  "expected_body": { "id": "__any__" },
  "max_response_ms": 500,
  "description": "Crear producto nuevo"
}
```

| Campo             | Requerido | Descripción                                                        |
|-------------------|-----------|--------------------------------------------------------------------|
| `method`          | ✅        | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS                      |
| `path`            | ✅        | Ruta relativa a `base_url`                                        |
| `body`            | ❌        | Cuerpo del request (se envía como JSON)                           |
| `headers`         | ❌        | Headers específicos de este endpoint (se fusionan con `global_headers`) |
| `expected_status` | ✅        | Código HTTP esperado                                              |
| `expected_body`   | ❌        | Campos esperados en la respuesta. Usar `"__any__"` para validar presencia sin importar valor |
| `max_response_ms` | ❌        | Tiempo máximo aceptable de respuesta en milisegundos              |
| `description`     | ❌        | Texto descriptivo para el reporte (mejora legibilidad)            |

---

## Lógica de Ejecución

```
Para cada endpoint:
  1. Construir URL = base_url + path
  2. Fusionar headers: global_headers ← headers del endpoint
  3. Ejecutar request con timeout definido
  4. Medir tiempo de respuesta
  5. Validar status_code vs expected_status
  6. Si hay expected_body → validar campos presentes en respuesta
  7. Si hay max_response_ms → validar tiempo de respuesta
  8. Registrar resultado completo
  9. Si stop_on_failure=true y fallo → detener
  10. Si retry configurado y fallo recuperable → reintentar (ver Retry)
```

### Config de Retry

```json
"retry": {
  "max_attempts": 3,
  "delay_ms": 1000,
  "on_status": [500, 502, 503, 504]
}
```

Solo reintenta si el status code recibido está en `on_status`. No reintenta errores de conexión indefinidamente (máximo `max_attempts`).

---

## Validación de `expected_body`

- Validación **parcial**: solo verifica los campos definidos, ignora campos extra.
- Valor `"__any__"`: valida que el campo exista, sin importar su valor.
- Valor concreto: valida igualdad exacta.
- Soporta **anidamiento**: `{ "user": { "id": "__any__" } }`.

Ejemplo:
```json
"expected_body": {
  "id": "__any__",
  "status": "activo"
}
```
→ La respuesta debe contener `id` (cualquier valor) y `status` igual a `"activo"`.

---

## Output del Orquestador

```json
{
  "success": true,
  "summary": {
    "total": 4,
    "passed": 3,
    "failed": 1,
    "duration_ms": 842
  },
  "results": [
    {
      "description": "Listar productos",
      "endpoint": "GET /productos",
      "status_received": 200,
      "status_expected": 200,
      "response_ms": 120,
      "ok": true
    },
    {
      "description": "Crear producto nuevo",
      "endpoint": "POST /productos",
      "status_received": 500,
      "status_expected": 201,
      "response_ms": 230,
      "ok": false,
      "failures": [
        "status: expected 201, got 500",
        "body: campo 'id' ausente en respuesta"
      ],
      "error_detail": "Internal Server Error",
      "retries": 2
    }
  ]
}
```

`success: true` solo si **todos** los endpoints pasaron.

---

## Manejo de Errores

| Situación                          | Comportamiento                                              |
|------------------------------------|-------------------------------------------------------------|
| Servidor no responde               | `ok: false`, `"error": "connection_refused"`               |
| Timeout excedido                   | `ok: false`, `"error": "timeout"`                          |
| Status incorrecto                  | `ok: false`, listar diferencia en `failures`               |
| Body no coincide                   | `ok: false`, detallar campos fallidos en `failures`        |
| Tiempo de respuesta excedido       | `ok: false`, `"error": "response_time_exceeded"`           |
| Error SSL/TLS                      | `ok: false`, `"error": "ssl_error"`                        |

---

## Reporte para el Usuario

Siempre que uses esta skill, presentá un resumen legible además del JSON de output:

```
✅ GET  /health           200  →  200   (45ms)
✅ GET  /productos        200  →  200   (120ms)
❌ POST /productos        500  →  201   (230ms)  [status incorrecto, campo 'id' ausente]
⏱️ GET  /reportes        200  →  200   (1240ms) [lento: excede 500ms]

Resultado: 2/3 pasaron | 1 fallaron | Duración total: 842ms
```

---

## Constraints de Seguridad

- **No ejecutar contra producción** sin confirmación explícita del usuario.
- Si `base_url` contiene dominios productivos conocidos (`.com`, `.io`, etc. sin `localhost`, `staging`, `dev`, `test`), **preguntar antes de ejecutar**.
- Limitar requests simultáneos (máx. 5 en paralelo por defecto).
- No loguear tokens o credenciales en los resultados.
- Si el endpoint requiere datos sensibles en el body, indicarlo en el reporte como `[datos sensibles omitidos]`.

---

## Notas para el Orquestador

- **Idempotente** si se usan métodos GET/HEAD; POST/PUT/DELETE pueden modificar estado → tenerlo en cuenta en pipelines.
- **Combina con**:
  - Skill de autenticación → pasar token en `global_headers.Authorization`
  - Skill de DB → seed/cleanup de datos de test antes/después
  - Skill de CI/CD → ejecutar como paso de validación post-deploy
- **Contexto recomendado a pasar**: ambiente (`dev`/`staging`/`prod`), versión del backend, últimos cambios relevantes.
- En pipelines CI/CD: si `success: false`, propagar como exit code 1.

---

## Ejemplo Completo

```json
{
  "base_url": "http://localhost:8000",
  "timeout": 5,
  "global_headers": {
    "Authorization": "Bearer eyJhbGci..."
  },
  "retry": {
    "max_attempts": 2,
    "delay_ms": 500,
    "on_status": [502, 503]
  },
  "stop_on_failure": false,
  "endpoints": [
    {
      "method": "GET",
      "path": "/health",
      "expected_status": 200,
      "max_response_ms": 200,
      "description": "Health check del servidor"
    },
    {
      "method": "GET",
      "path": "/productos",
      "expected_status": 200,
      "expected_body": { "items": "__any__" },
      "description": "Listar productos"
    },
    {
      "method": "POST",
      "path": "/productos",
      "body": { "nombre": "test", "precio": 100 },
      "expected_status": 201,
      "expected_body": { "id": "__any__", "nombre": "test" },
      "description": "Crear producto nuevo"
    },
    {
      "method": "DELETE",
      "path": "/productos/test",
      "expected_status": 204,
      "description": "Cleanup: eliminar producto de test"
    }
  ]
}
```
