# Tarea Pendiente: Corrección de Alineación de Iconos e Inputs

## 📌 Problema
En varios campos de entrada (`<input type="text">`, `<input type="date">`, `<input type="search">`) que llevan un icono interior alineado a la izquierda (ej. lupa, usuario, calendario), el texto del *placeholder* o el valor ingresado se solapa con el icono.

## 🔍 Causa Raíz
En `assets/css/main.css`, los selectores globales:
```css
input[type="text"],
input[type="email"],
input[type="password"],
input[type="url"],
input[type="date"],
input[type="time"],
select,
textarea {
    width: 100%;
    padding: 12px 16px;
    background-color: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-main);
    transition: all var(--transition-fast);
}
```
tienen mayor especificidad CSS que la clase de utilidad Tailwind `.pl-10` (`padding-left: 2.5rem`). Por lo tanto, los inputs terminan con `padding-left: 16px;`, haciendo que el texto inicie justo sobre el icono colocado a `left: 14px;`.

---

## 🛠️ Solución Estandarizada

### 1. Estructura HTML recomendada para Inputs con Icono a la Izquierda
```html
<div class="relative flex-1 min-w-0">
    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
        <i class="fa-solid fa-magnifying-glass text-sm"></i>
    </div>
    <input type="text" placeholder="Buscar..."
        style="padding-left: 40px !important;"
        class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
</div>
```

### 2. Para Inputs de Fecha (`type="date"`)
Añadir la llamada nativa `showPicker()` en el atributo `onclick`:
```html
<input type="date" id="mi-filtro-fecha" onclick="try{this.showPicker()}catch(e){}"
    style="padding-left: 40px !important;"
    class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer" />
```

---

## 📋 Lista de Vistas a Revisar y Corregir:
- [x] `views/announcements.php` *(Corregido: padding-left 40px !important y showPicker())*
- [x] `views/suggestions.php` *(Corregido: padding-left 40px !important en filtros de móvil y desktop)*
- [x] `views/songs.php` *(Corregido: buscador general de canciones)*
- [x] `views/setlists.php` *(Corregido: buscador general de repertorios)*
- [x] `views/events.php` *(Revisado: sin inputs con icono interior)*
- [x] `views/members.php` *(Revisado: sin inputs con icono interior)*
- [x] `views/profile.php` *(Corregido: alineación del icono `@` en modal de editar perfil)*
- [x] Modales globales (`views/includes/modals.php`) *(Revisado: alineación correcta sin iconos sobrepuestos)*
