---
name: frontend-code-rules
description: Reglas de código obligatorias del frontend de wlearning (React/TypeScript, HTML semántico y CSS Modules) — SOLID, naming en inglés, máximo 100 líneas por archivo, sin comentarios, accesibilidad y tooling. Úsala SIEMPRE que escribas, edites o revises código .ts, .tsx o .css en este repo.
---

# Reglas de código — frontend wlearning

## Reglas duras

1. **Máximo 100 líneas por archivo** (`.ts`, `.tsx`, `.css`), incluidos los tests. Si crece, se extrae un subcomponente, un hook o una función.
2. **Sin comentarios** de ningún tipo: `//`, `/* */`, `{/* */}`, JSDoc, `eslint-disable`, `@ts-ignore` ni `@ts-expect-error`. Tampoco en CSS.
3. **Naming en inglés**: archivos, componentes, props, variables, clases CSS, rutas y claves de i18n. Solo el texto visible al usuario va en español.
4. **Un export principal por archivo.** El archivo se llama como lo que exporta.
5. **TypeScript estricto**: sin `any`, sin `as` salvo en mappers de infraestructura y sin non-null `!`.
6. **Se escribe primero el test** (ver skill `frontend-tdd`).

## SOLID en frontend

- **S**: un componente hace una cosa. Si tiene lógica y UI a la vez, la lógica va a un hook o a un caso de uso.
- **O**: los componentes se extienden por composición (`children`, props de variante), no con `if` por cada caso nuevo.
- **L**: toda implementación de un puerto (`ApiCourseRepository`, `InMemoryCourseRepository`) es intercambiable.
- **I**: props mínimas. No pases objetos enteros si el componente usa dos campos.
- **D**: la presentación depende de casos de uso inyectados por contexto, nunca de adaptadores.

## Naming

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componente o página (archivo y carpeta) | PascalCase | `CourseCard/CourseCard.tsx` |
| CSS Module | igual que el componente | `CourseCard.module.css` |
| Otros archivos `.ts` | camelCase | `apiCourseRepository.ts` |
| Clases de caso de uso y adaptador | PascalCase | `ListCourses`, `ApiCourseRepository` |
| Hooks | `use` + sustantivo | `useCourses` |
| Handlers | `handle` + evento; props `on` + evento | `handleSubmit`, `onSubmit` |
| Booleanos | `is`, `has`, `can` | `isLoading` |
| Clases CSS | camelCase dentro del módulo | `.cardTitle` |
| Tests | `*.test.ts(x)` junto al archivo | `CourseCard.test.tsx` |

## HTML

- Semántica real: `button` para acciones, `a` para navegación, `main`, `nav`, `header`, `section`, `ul/li` para listas y `form` con `label` asociado.
- Accesibilidad: `alt` en imágenes, foco visible, navegable con teclado, contraste AA y `aria-*` solo cuando no exista un elemento nativo.
- Un `h1` por página y jerarquía de encabezados sin saltos.

## CSS

- CSS Modules por componente. Sin estilos inline ni `!important`.
- Colores, espacios, tipografía, radios y sombras solo desde tokens (`var(--color-primary)`) definidos en `styles/tokens.css`.
- Mobile first, con `min-width` en media queries y los breakpoints de los tokens.
- Layout con flex y grid. Sin números mágicos: si un valor se repite, se convierte en token.

## JavaScript y TypeScript

- Funciones cortas, retornos tempranos y máximo 3 parámetros (si hay más, un objeto tipado).
- Inmutabilidad: `readonly` en tipos de dominio, sin mutar props ni estado.
- Nada de lógica de negocio en componentes, efectos ni `useEffect` para derivar datos.
- Los errores de la API se traducen a errores de dominio en infraestructura.
- Las variables de entorno solo se leen en `core/config/env.ts`.

## Tooling y verificación

```bash
npm run format:check
npm run lint
npm run typecheck
node .claude/skills/frontend-code-rules/scripts/check-rules.mjs
npm run test -- --run
```

`check-rules.mjs` valida en `src/` el límite de 100 líneas, que no haya comentarios en TS, TSX y CSS y el naming de archivos. Necesita `typescript` en devDependencies.
