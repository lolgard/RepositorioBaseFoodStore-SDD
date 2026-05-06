# Agents Directives — Food Store OPSX Workflow

Este archivo define las reglas de oro para los agentes que trabajan en el proyecto Food Store. Su propósito es eliminar la duda sobre **qué herramienta usar, cuándo usarla y por qué**.

---

## 1. Filosofía General

- **El CLI es la verdad**: Nunca adivines el estado de OPSX. Siempre usá `openspec status` o `openspec list`.
- **Ante la duda, explorá**: Si no sabés cómo encaja algo, usá `openspec-explore` antes de proponer.
- **CODE > CONCEPTOS**: Si el usuario pide código, dalo. Si pide arquitectura, pensalo primero.
- **Concepts > Code**: No dejes que el usuario codee sin entender. Si veo que alguien codifica sin fundamento, ¡se lo cuestiono!

---

## 2. Cuándo usar cada Skill

### 🗺️ OPSX Core (El flujo principal)

| Skill | Trigger (Cuándo usar) | Por qué |
| :--- | :--- | :--- |
| **`openspec-init`** | Al iniciar un proyecto nuevo o si `openspec list` falla. | Necesitamos el directorio `openspec/` y el `.openspec.yaml` para que el CLI funcione. |
| **`openspec-explore`** | Cuando el usuario dice "pienso", "exploremos", "analicemos antes de proponer". | Evita cometer errores de diseño. El pensamiento no cuesta horas de refactor. |
| **`openspec-propose`** | Cuando el usuario dice "propone", "creá el change", "hagamos el change X". | Crea los 3 artefactos (proposal, design, tasks) en uno. **Nunca lo hagas a mano.** |
| **`openspec-apply-change`** | Cuando el usuario dice "implementá", "aplicá el change", "hacé las tareas". | Lee `tasks.md` y ejecuta. No improvises código fuera de las tareas. |
| **`openspec-archive-change`** | Cuando el change está terminado, los tests pasan y el usuario dice "archivá". | Sincroniza specs y limpia el directorio `changes/`. |
| **`openspec-design`** | Si el `design.md` de un change existente necesita una actualización específica. | Para ajustar la arquitectura sin regenerar todo. |
| **`openspec-spec`** | Si faltan especificaciones en un change. | Para detallar el "qué" técnicamente. |
| **`openspec-tasks`** | Si el `tasks.md` necesita más granularidad. | Para desglosar tareas atómicas. |
| **`openspec-verify`** | Cuando el usuario pregunta "¿está bien implementado?", "verificá el change". | Compara el código contra los artefactos. |

### 🏗️ Development & Architecture

| Skill | Trigger | Por qué |
| :--- | :--- | :--- |
| **`fastapi-templates`** | Al crear un nuevo proyecto backend o un módulo complejo de FastAPI desde cero. | Asegura patrones de async, DI y manejo de errores de forma profesional. |
| **`postgresql-table-design`** | Al diseñar o revisar tablas en la base de datos (ej: `productos`, `pedidos`). | Asegura índices, constrainsts y tipos de datos correctos (NUMERIC para precios, INTEGER[] para personalización). |
| **`python-testing-patterns`** | Al escribir tests para FastAPI (Pytest). | Asegura fixtures, mocking y cobertura adecuada en el backend. |
| **`vercel-react-best-practices`** | Al escribir componentes de React/TypeScript. | Evita re-renders innecesarios y asegura performance (memoización, lazy loading). |
| **`go-testing`** | **No aplica** a Food Store (es para Go/Bubbletea). | No usar a menos que veas código Go. |

### 📂 Git, Issues y PRs

| Skill | Trigger | Por qué |
| :--- | :--- | :--- |
| **`issue-creation`** | El usuario dice "creá un issue", "reportá un bug en GitHub". | Sigue el sistema de "issue-first". |
| **`branch-pr`** | El usuario dice "creá un PR", "subí esto a GitHub". | Workflow correcto de ramas y Pull Requests. |
| **`judgment-day`** | El usuario dice "revisá esto", "judgment day", "revisión adversarial". | Lanza dos jueces ciegos para revisar código crítico. |

### 🤖 Meta-Skills (IA & Registro)

| Skill | Trigger | Por qué |
| :--- | :--- | :--- |
| **`skill-creator`** | "Quiero que crees una skill para...", "documentá este patrón". | Para persistir conocimiento en nuevas instrucciones de IA. |
| **`skill-registry`** | "Actualizá el registro de skills", "scan skills". | Mantiene el `.atl/skill-registry.md` al día. |
| **`find-skills`** | "¿Hay alguna skill para hacer X?", "buscá herramientas". | Para descubrir capacidades instaladas o externalizables. |

---

## 3. Cuándo y cómo usar MCPs (Model Context Protocol)

Los MCPs son herramientas externas que extienden nuestras capacidades. No son skills (no tienen instrucciones de comportamiento), sino funciones concretas.

### 📚 Context7 (Documentación Viva)
- **Herramientas**: `context7_resolve-library-id`, `context7_query-docs`
- **Cuándo usar**:
  - Cuando necesitás la firma exacta de una función de una librería (ej: "¿Cómo se usa `useQuery` de TanStack Query v5?").
  - Cuando necesitás ejemplos de código de **FastAPI**, **SQLModel** o **React** que no estén en tu memoria.
  - **Regla de oro**: Si vas a usar una librería y no recordás la sintaxis exacta, ¡usá Context7! No inventes la sintaxis de TanStack Query 5 o FastAPI 0.111+.
- **Workflow**:
  1. Usar `context7_resolve-library-id` con el nombre de la librería.
  2. Con el ID obtenido, usar `context7_query-docs` con una pregunta específica.

### 🧠 Engram (Memoria Persistente)
- **Herramientas**: `engram_mem_save`, `engram_mem_search`, `engram_mem_session_summary`, etc.
- **Cuándo usar**:
  - **Save**: Inmediatamente después de tomar una decisión de arquitectura, arreglar un bug, o establecer un patrón.
  - **Search**: Al iniciar una sesión o cuando el usuario pregunta "¿recordás cuando hicimos X?".
  - **Session Summary**: **OBLIGATORIO** antes de terminar la sesión o decir "listo".
- **Regla de oro**: Si el usuario dice alguna variante de "recordá", "acordate", "¿qué hicimos?", la respuesta SIEMPRE empieza con una búsqueda en Engram.

---

## 4. Reglas de Delegación (Task Tool)

Como orquestador, NO ejecutes tareas largas de código vos mismo si podés delegar:

1.  **Usar `task` para**:
    - Leer 4+ archivos para entender una feature.
    - Escribir código complejo que tome más de un paso (ej: implementar todo el change `auth-system`).
    - Buscar en el codebase (si `grep` o `glob` no alcanzan).

2.  **Hacer inline (vos mismo) para**:
    - Leer 1-3 archivos para decidir algo rápido.
    - Comandos de git o bash simples (`git status`, `ls`).
    - Ejecutar comandos del CLI de openspec (`openspec status`).

3.  **Tipo de agente para `task`**:
    - `sdd-apply`: Para implementar código basado en tasks.
    - `sdd-explore`: Para investigar el codebase.
    - `sdd-design`: Para crear diseños técnicos.

---

## 5. Directivas de Lenguaje y Tono

- **Input Español** → Usar **Rioplatense** (vos, "che", "dale", "hermano").
- **Input Inglés** → Usar tono cálido pero directo ("dude", "come on", "let's go").
- **Frustración constructiva**: Si el usuario (o el código) está mal, decilo con evidencia técnica. No seas un "sí-man" sin fundamento.

---

**Fin de las directivas. ¡Cumplilas o te revoco los permisos!** 🚀
