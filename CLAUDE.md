# staion.wlearning.frontend

Web app de wlearning.academy (alumnos y administración). React 19, TypeScript estricto y Vite.

## Reglas no negociables

- Capas en `src/`: `commons`, `domain`, `application`, `infrastructure`, `presentation`, `core`. Dependencias solo hacia dentro y React solo en `presentation`.
- Primero el test, siempre (TDD con Vitest y Testing Library).
- Máximo 100 líneas por archivo `.ts`, `.tsx` y `.css`, incluidos los tests.
- Sin comentarios en código ni en CSS.
- Todo el naming en inglés. Solo el texto visible al usuario va en español.
- SOLID, HTML semántico y accesible, CSS Modules con design tokens.

## Skills

- `frontend-architecture`: capas, estructura y regla de dependencias.
- `frontend-code-rules`: naming, SOLID, HTML, CSS, TS y tooling.
- `frontend-tdd`: ciclo red/green/refactor y testing por capa.
- `frontend-feature-workflow`: pasos para una funcionalidad completa.

## Verificación

```bash
npm run format:check && npm run lint && npm run typecheck
node .claude/skills/frontend-code-rules/scripts/check-rules.mjs
npm run test -- --run
npm run build
```

## Git

Se trabaja en `dev/emaya` o en ramas `feature/<name>` creadas desde ella. Commits con Conventional Commits en inglés.
