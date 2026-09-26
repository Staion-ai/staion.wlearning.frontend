---
name: frontend-tdd
description: Flujo TDD obligatorio del frontend de wlearning con Vitest, Testing Library y MSW — ciclo red/green/refactor, qué testear en cada capa y cómo. Úsala SIEMPRE antes de escribir o cambiar código en src/.
---

# TDD — frontend wlearning

## Ciclo

1. **Red**: escribe un test con un solo comportamiento y confirma que falla por la razón correcta.
2. **Green**: escribe el código mínimo para pasarlo.
3. **Refactor**: aplica `frontend-code-rules` con los tests en verde.

```bash
npm run test -- src/domain/progress/valueObjects/progress.test.ts
```

## Qué y cómo testear por capa

| Capa | Herramienta | Enfoque |
|---|---|---|
| domain | Vitest | funciones puras: entrada → salida, sin mocks |
| application | Vitest + fakes en memoria | el caso de uso con un `InMemoryCourseRepository` |
| infrastructure | Vitest + MSW | el adaptador real contra respuestas HTTP simuladas y el mapeo DTO → entidad |
| presentation | Testing Library + fakes vía `DependenciesProvider` | lo que ve y hace el usuario |

Los tests van junto al archivo (`CourseCard.test.tsx`). Los fakes compartidos van en `src/testing/fakes/<module>/` y los helpers de render en `src/testing/renderWithDependencies.tsx`. `src/testing` no se importa desde producción.

## Reglas de Testing Library

- Consulta por rol y nombre accesible: `getByRole('button', { name: 'Enroll' })`. `getByTestId` solo como último recurso.
- Interacciones con `userEvent`, no con `fireEvent`.
- Prueba comportamiento, no implementación: nada de estado interno ni snapshots de componentes.
- Cada página cubre los estados loading, error, empty y success.
- Un comportamiento por test, con nombres en inglés: `it('shows an error message when the API fails')`.
- Estructura Arrange / Act / Assert separada por líneas en blanco, sin comentarios.
- Los tests también tienen máximo 100 líneas por archivo.

## Configuración (vite.config.ts)

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./src/testing/setupTests.ts'],
  coverage: {
    provider: 'v8',
    include: ['src/domain/**', 'src/application/**'],
    thresholds: { lines: 90, functions: 90, branches: 90 },
  },
},
```

## Ejemplo

Red:

```ts
import { describe, expect, it } from 'vitest';
import { calculateProgress } from './progress';

describe('calculateProgress', () => {
  it('returns the completed percentage rounded down', () => {
    const progress = calculateProgress({ completed: 17, total: 50 });

    expect(progress).toBe(34);
  });

  it('returns zero when the course has no lessons', () => {
    expect(calculateProgress({ completed: 0, total: 0 })).toBe(0);
  });
});
```

Green:

```ts
type ProgressInput = Readonly<{ completed: number; total: number }>;

export const calculateProgress = ({ completed, total }: ProgressInput): number =>
  total === 0 ? 0 : Math.floor((completed / total) * 100);
```

Componente:

```tsx
it('lists the courses returned by the use case', async () => {
  renderWithDependencies(<CoursesPage />, { listCourses: new ListCourses(new InMemoryCourseRepository([course])) });

  expect(await screen.findByRole('heading', { name: course.title })).toBeInTheDocument();
});
```
