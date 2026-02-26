# Resumen de cambios — 26 de febrero de 2026

Este documento resume los cambios más importantes realizados en la aplicación durante esta sesión de trabajo.

---

## 1. Botones de dificultad en el formulario "Crear reto"

**Qué era el problema:** Los 4 botones de dificultad (Fácil / Medio / Difícil / Experto) se partían en dos filas en pantallas pequeñas, quedando desordenados.

**Qué se hizo:** Se cambió el contenedor de los botones a un grid de 4 columnas fijas. Ahora los 4 botones siempre aparecen en una sola fila, con el mismo ancho cada uno, independientemente del tamaño de pantalla. Además, la sección de dificultad se colocó más a la derecha del formulario, ocupando el espacio disponible tras el campo "Número de preguntas".

---

## 2. Buscar un reto por ID

**Qué era el problema:** La sección "Introducir ID" de la pantalla de Retos tenía el campo y el botón, pero no hacían nada.

**Qué se hizo:** Ahora funciona completamente:
- El usuario escribe un número de ID y pulsa "Aceptar" (o Enter).
- Si existe un reto con ese ID en la base de datos, se abre directamente para jugarlo.
- Si no existe, aparece un mensaje de error indicando que no se encontró ningún reto con ese ID.
- El botón queda desactivado mientras busca o si el campo está vacío.

---

## 3. Barra lateral siempre visible + botón de volver

**Qué era el problema:** Al entrar en un reto (para jugarlo o editarlo), el botón de toggle de la barra lateral desaparecía del TopBar, siendo reemplazado por la flecha de volver.

**Qué se hizo:** Ahora el TopBar muestra siempre el botón de toggle del sidebar. Cuando se está dentro de un reto, además aparece la flecha de volver justo al lado — los dos botones conviven.

---

## 4. Pantallas de "Jugar reto" y "Editar reto" más grandes

**Qué era el problema:** Las pantallas de jugar un reto y de editar/revisar sus preguntas se mostraban como una tarjeta flotante pequeña con márgenes grises alrededor, dando sensación de pop-up.

**Qué se hizo:** Ahora estas pantallas ocupan todo el área disponible del contenido (de borde a borde, sin márgenes extra). El sidebar sigue siendo visible a la izquierda y el TopBar sigue visible arriba. En móvil, se respeta el espacio de la barra de navegación inferior.

**Técnicamente:** Se añadió `position: relative` al contenedor principal del layout (`main`), y las pantallas de jugar/editar usan `position: absolute; inset: 0` para cubrir todo ese espacio.

---

## 5. Pantalla principal de Retos — sin cambios

La página principal de Retos (lista de retos creados, sección del profesor, botón de crear nuevo) se dejó tal como estaba. Los ajustes de tamaño solo aplican a las sub-pantallas de jugar y editar.
