# User Feed

Hosted at https://user-feed-lake.vercel.app/users

## Para ejecutar la app

### Con Docker

```bash
docker build -t user-feed .
docker run --rm -p 5084:5084 user-feed      # http://localhost:5084
```

### Con el build de producción (recomendado)

Requisitos: Node 24 (`^22.13.0`) y pnpm. pnpm usa por su cuenta la versión del campo `packageManager`. Con `npm i -g pnpm` o `corepack enable` se instala pnpm.

```bash
pnpm i              # instala dependencias
pnpm build && pnpm --filter web start      # http://localhost:5084
```

### En modo desarrollo

```bash
pnpm i              # instala dependencias
pnpm dev            # http://localhost:5084
```

La app usa el puerto 5084 para no chocar con otros proyectos en el 3000.

## Decisiones

Uso dos estrategias distintas para mostrar los datos, el objetivo es mostrar el conocimiento técnico y tener diferentes enfoques para la entrevista. De igual manera se introduce la paginación ya que es común en producción.

- En /users la lista de usuarios es SSR, ambas la query y la paginación son `queryParams` con cache en el servidor.
- En /users/[id] el feed de publicaciones es CSR, con `useInfiniteQuery` de TanStack Query, que usa un Server Action para pedir más publicaciones.
- Los filtros de búsqueda en ambos casos usan la query con el objetivo que los usuarios puedan compartir la url y se comparta lo que ven. (Esto sería mejor si la paginación en la api fuera con cursor y no con offset)

Para la `creación de publicaciones`, usamos un store para guardar en el server las publicaciones creadas, para hacerlo lo más realista posible. Acá tomé la decisión de invalidar la cache antes que agregar a la lista y evitar la petición, por preferencia ya que si fuera una app donde varios usuarios estuvieran creando publicaciones, entonces ya recuperaríamos las nuevas publicaciones y no parecería como la creada por el usuario como la única nueva publicación. Este tipo de decisiones en la práctica se consultan con lo que necesita el negocio y la cantidad de usuarios que interactúan con la app.

Usé un monorepo ya que en la entrevista veo que usan Node, específicamente Nestjs que con los últimos avances permite usar Zod para las validaciones, lo cual es perfecto para reutilizar el código en un package y compartirlo entre el frontend y la api.

## Con más tiempo

Con más tiempo hubiera hecho un mejor scaffolding del proyecto, incluyendo los test que es preferible separarlos por los features, de la misma forma hubiera diseñado los test dirigidos y usando data-test-id, y no solo los necesarios por la IA para comprobar que todo está bien.

Hubiera incluido playwright para hacer tests e2e (organizados con el patrón POM, por temas de organización), ya que los componentes de servidor no se pueden testear con testing-library (no permite componentes asíncronos).

Hubiera hecho la primera llamada de datos del feed de /users/[id] en el servidor, e hidratando a tanstack.

Habría agregado el filtro de ordenación que la api lo permite, junto con otros filtros interesantes que aparecen en github.

Un package para el fetch personalizado.

Y nunca está de más hacer más code review, y qa manual con datos mockeados para ver que todo funciona como se espera.

## Cómo usé la IA

Usé Claude Code (usualmente lo combino con Codex para tareas de implementación).
Uso ce [https://github.com/everyinc/compound-engineering-plugin](https://github.com/everyinc/compound-engineering-plugin), es un workflow bastante consistente brainstorming -> plan -> work -> code review (simplify, code review polish...). Básicamente genera un plan [en docs/plans](docs/plans), este plan es el resultado de preguntas y tareas que le vas dando para que investigue, el plan es bastante detallado por lo que es un poco largo y realmente lo aconsejo para proyectos donde las reglas de negocio sean complejas, no para un proyecto simple como este.

Más allá de eso, la IA prefiere usar Vite, lo cual no aconsejo para los proyectos en producción ya que no tiene SSR nativo, los request se hacen del lado del cliente (salen en la pestaña Network) por lo cual cualquiera con una IA puede obtener el shape de tu API, obtener tokens. Para prototipos o con un buen fundamento lo recomiendo ya que es muy ligero.

Acepté el diseño de dos estrategias, la exploración de la API (los parámetros que admite y su comportamiento real, que tuve que contrastar con github ya que en la doc de la api solo estaban los ejemplos básicos) y la mayor parte de la implementación y de los tests, revisando cada cambio antes del commit.

Otras correcciones son más de código, pues al no tener un código base la IA hace patrones que son comunes en internet, pero no son los correctos como crear un hook propio para hacer el debounce cuando ya nuqs lo trae, o crear estados de más para casos hipotéticos.
