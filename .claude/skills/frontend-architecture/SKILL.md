---
name: frontend-architecture
description: Arquitectura por capas (hexagonal) de la web app de wlearning en React + TypeScript + Vite. Úsala SIEMPRE antes de crear, mover o importar cualquier archivo en src/ para decidir la capa correcta y respetar la regla de dependencias.
---

# Arquitectura — frontend wlearning

Mismas capas que el backend. La lógica de negocio y los casos de uso son TypeScript puro, sin React ni `fetch`. React solo vive en `presentation`.

## Stack

Vite, React 19, TypeScript `strict`, React Router, TanStack Query, CSS Modules con design tokens en custom properties, Vitest, Testing Library, MSW, ESLint y Prettier.

## Estructura

```
src/
  commons/                          utilidades puras sin negocio
    result.ts
    formatDate.ts
  domain/<module>/
    entities/course.ts              tipo + funciones puras de negocio
    valueObjects/progress.ts
    errors/courseNotFoundError.ts
    ports/courseRepository.ts       interface
  application/<module>/
    useCases/listCourses.ts         class ListCourses { execute() }
  application/dependencies.ts       interface Dependencies con todos los casos de uso
  infrastructure/
    http/httpClient.ts              wrapper de fetch con baseUrl, token y errores
    <module>/apiCourseRepository.ts implementa CourseRepository
    <module>/courseDto.ts           forma exacta de la API
    <module>/courseMapper.ts        dto ↔ entidad
  presentation/
    app/App.tsx
    app/router.tsx
    providers/DependenciesContext.tsx
    hooks/<module>/useCourses.ts    TanStack Query + caso de uso
    pages/<module>/CoursesPage/CoursesPage.tsx (+ .module.css, .test.tsx)
    components/ui/Button/Button.tsx (+ .module.css, .test.tsx)
    components/<module>/CourseCard/CourseCard.tsx
    styles/tokens.css, reset.css, global.css
  core/
    config/env.ts                   lee y valida import.meta.env
    container.ts                    crea adaptadores y casos de uso
    main.tsx                        monta <DependenciesProvider value={container}><App/>
```

`<module>` es un contexto de negocio en inglés: `auth`, `courses`, `learners`, `progress`, `reports`.

## Regla de dependencias

| Capa | Puede importar | Prohibido |
|---|---|---|
| commons | nada del proyecto | todas las capas, react |
| domain | commons | application, infrastructure, presentation, core, react, librerías HTTP |
| application | domain, commons | infrastructure, presentation, core, react |
| infrastructure | domain, application, commons | presentation, core, react |
| presentation | application, domain, commons, react | infrastructure, core |
| core | todas | — |

`presentation` nunca llama a `fetch` ni importa adaptadores. Recibe los casos de uso por contexto:

```tsx
const dependencies = useDependencies();
return useQuery({ queryKey: ['courses'], queryFn: () => dependencies.listCourses.execute() });
```

## Enforcement automático (eslint.config.js)

```js
'import/no-restricted-paths': ['error', { zones: [
  { target: './src/commons', from: ['./src/domain', './src/application', './src/infrastructure', './src/presentation', './src/core'] },
  { target: './src/domain', from: ['./src/application', './src/infrastructure', './src/presentation', './src/core'] },
  { target: './src/application', from: ['./src/infrastructure', './src/presentation', './src/core'] },
  { target: './src/infrastructure', from: ['./src/presentation', './src/core'] },
  { target: './src/presentation', from: ['./src/infrastructure', './src/core'] },
] }],
```

Además, en `src/{commons,domain,application,infrastructure}/**` se prohíbe `react` y `react-dom` con `no-restricted-imports`.

## Decidir la capa

1. ¿Es una regla de negocio o un cálculo, por ejemplo el porcentaje de progreso? → domain.
2. ¿Es una intención del usuario que orquesta puertos? → application.
3. ¿Habla con la API, `localStorage` o un SDK externo? → infrastructure.
4. ¿Pinta UI, maneja estado de pantalla o navegación? → presentation.
5. ¿Configura o conecta? → core.

## Componentes

- **ui/**: primitivas genéricas sin negocio (`Button`, `Input`, `Modal`), accesibles y basadas en tokens.
- **components/<module>/**: componentes de negocio que componen primitivas. Reciben datos por props y no hacen fetch.
- **pages/**: una por ruta. Usan hooks, manejan los estados loading, error y empty, y componen componentes.
- **hooks/**: puente entre React y los casos de uso. Aquí se usa TanStack Query.
