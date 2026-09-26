---
name: frontend-feature-workflow
description: Paso a paso para implementar una pantalla o funcionalidad completa en la web app de wlearning, del dominio a la UI, con TDD y la verificación final. Úsala cuando se pida una página, flujo, formulario, integración con la API o cualquier funcionalidad nueva del frontend.
---

# Flujo de una funcionalidad — frontend wlearning

Aplica siempre junto a `frontend-architecture`, `frontend-code-rules` y `frontend-tdd`.

## 0. Entender

- Intención en una frase: "El alumno ve sus cursos con el progreso real".
- Contrato de la API. Si el endpoint del backend no existe, se acuerda primero con el equipo de backend.
- Diseño: estados loading, error, empty y success, y comportamiento en móvil y escritorio.

## 1. Dominio

Tests primero. Tipos `readonly`, value objects como funciones puras, errores de dominio y puerto (`interface CourseRepository`).

## 2. Aplicación

Fake en memoria, tests y caso de uso `class ListCourses { constructor(private readonly repository: CourseRepository) {} execute() }`. Después, añádelo a `application/dependencies.ts`.

## 3. Infraestructura

`courseDto.ts` con la forma exacta de la API, `courseMapper.ts` y `apiCourseRepository.ts` sobre `httpClient`. Tests con MSW para el camino feliz y los errores 4xx y 5xx.

## 4. Presentación

1. Hook `useCourses` con TanStack Query y el caso de uso del contexto.
2. Primitivas de `ui/` que falten, cada una con su test y su CSS Module basado en tokens.
3. Componentes de negocio que reciben datos por props.
4. Página con todos sus estados y su ruta en `router.tsx`.
5. Revisión de accesibilidad: teclado, foco, roles y contraste.

## 5. Composición

Instancia el adaptador y el caso de uso en `core/container.ts`. Las variables de entorno nuevas van en `core/config/env.ts` y `.env.example`, con el prefijo `VITE_`.

## 6. Verificación y commit

```bash
npm run format:check && npm run lint && npm run typecheck
node .claude/skills/frontend-code-rules/scripts/check-rules.mjs
npm run test -- --run
npm run build
```

Commits con Conventional Commits en inglés en `dev/emaya` o en `feature/<name>`:

```
feat(courses): show learner progress on course list
```
