<!-- Events & Calendar Screen (Minimalist UI - Dual Light & Dark Mode) -->
<div class="space-y-5 screen-fade">
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Eventos</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Programación de ensayos, conciertos y servicios</p>
        </div>
        <div class="flex items-center gap-2">
            <!-- View Mode Switcher -->
            <div class="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
                <button type="button" id="toggle-view-list" class="px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition [&.active]:bg-white dark:[&.active]:bg-zinc-800 [&.active]:text-zinc-900 dark:[&.active]:text-white [&.active]:shadow-sm active">
                    <i class="fa-solid fa-list mr-1.5 text-[11px]"></i>Lista
                </button>
                <button type="button" id="toggle-view-calendar" class="px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition [&.active]:bg-white dark:[&.active]:bg-zinc-800 [&.active]:text-zinc-900 dark:[&.active]:text-white [&.active]:shadow-sm">
                    <i class="fa-regular fa-calendar-days mr-1.5 text-[11px]"></i>Calendario
                </button>
            </div>

            <!-- Schedule Event Trigger Button -->
            <button type="button" id="btn-schedule-event" class="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-lg font-bold shadow-md hover:scale-105 transition" style="display: none;">
                +
            </button>
        </div>
    </header>

    <!-- WRAPPER 1: List View -->
    <div id="events-list-wrapper" class="space-y-3">
        <div id="events-list-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Dynamic Event Cards rendered by JS -->
        </div>

        <!-- Load More Container -->
        <div id="events-load-more-container" class="pt-2 text-center hidden">
            <button type="button" id="btn-events-load-more" class="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm cursor-pointer">
                Cargar más
            </button>
        </div>
    </div>

    <!-- WRAPPER 2: Calendar View -->
    <div id="events-calendar-wrapper" class="hidden space-y-4">
        <!-- Month Navigation Bar -->
        <div class="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
            <button type="button" id="btn-prev-month" class="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold transition">&larr;</button>
            <span id="calendar-month-year" class="font-bold text-base text-zinc-900 dark:text-zinc-100">Cargando mes...</span>
            <button type="button" id="btn-next-month" class="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold transition">&rarr;</button>
        </div>

        <!-- Calendar Grid Card -->
        <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 text-center font-bold text-xs text-zinc-400 dark:text-zinc-500 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 uppercase tracking-wider">
                <div>Dom</div>
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
            </div>

            <!-- Calendar Cells Grid -->
            <div id="calendar-grid-cells" class="grid grid-cols-7 divide-x divide-y divide-zinc-100 dark:divide-zinc-800/60 border-b border-l border-zinc-100 dark:border-zinc-800/60">
                <!-- 42 cells rendered dynamically -->
            </div>
        </div>
    </div>
</div>

<!-- ================= MODALS SECTION ================= -->

<!-- MODAL 1: Programar / Agregar Evento -->
<!-- MODAL 1: Programar / Agregar Evento (Wizard 2 Pasos) -->
<div id="modal-schedule-event" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade flex flex-col max-h-[90vh]">
        <!-- Header con indicador de pasos -->
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
            <div>
                <h3 class="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">Programar Nuevo Evento</h3>
                <div class="flex items-center gap-2 mt-1">
                    <span id="event-step-badge-1" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition">1. Información</span>
                    <i class="fa-solid fa-chevron-right text-[8px] text-zinc-400"></i>
                    <span id="event-step-badge-2" class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition">2. Roster y Músicos</span>
                </div>
            </div>
            <button type="button" id="btn-close-schedule-event-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition btn-close-modal">&times;</button>
        </div>

        <form id="event-schedule-form" class="overflow-y-auto flex-1 p-5">
            <!-- PASO 1: INFORMACIÓN GENERAL -->
            <div id="event-modal-step-1" class="space-y-4">
                <div class="space-y-1.5">
                    <label for="event-form-name" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nombre del Evento</label>
                    <input type="text" id="event-form-name" placeholder="Ej. Servicio Dominical / Ensayo General" required
                        class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                        <label for="event-form-date" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Fecha</label>
                        <input type="date" id="event-form-date" required
                            class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                    </div>
                    <div class="space-y-1.5">
                        <label for="event-form-time" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Hora</label>
                        <input type="time" id="event-form-time" required
                            class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                        <label for="event-form-type" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tipo de Evento</label>
                        <select id="event-form-type" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition">
                            <!-- Options populated by JS -->
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label for="event-form-setlist" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Repertorio Asignado</label>
                        <select id="event-form-setlist" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition">
                            <!-- Options populated dynamically -->
                        </select>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label for="event-form-desc" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Notas / Descripción</label>
                    <textarea id="event-form-desc" rows="3" placeholder="Notas sobre vestuario, orden especial, etc..."
                        class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition"></textarea>
                </div>
            </div>

            <!-- PASO 2: ASIGNACIÓN DE ROLES Y MÚSICOS (ROSTER) -->
            <div id="event-modal-step-2" class="space-y-4 hidden screen-fade">
                <!-- Resumen breve del evento configurado en paso 1 -->
                <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <div class="min-w-0 pr-2">
                        <h4 id="event-step-summary-title" class="font-bold text-zinc-900 dark:text-zinc-100 truncate">Evento</h4>
                        <p id="event-step-summary-meta" class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Fecha y Hora</p>
                    </div>
                    <span id="event-step-summary-type" class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase flex-shrink-0">Tipo</span>
                </div>

                <!-- Barra de selección rápida de roles -->
                <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">Roles Disponibles</span>
                        <span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">Toca para agregar puestos</span>
                    </div>
                    <div id="event-quick-roles-bar" class="flex flex-wrap gap-1.5 pb-1 max-h-28 overflow-y-auto">
                        <!-- Populated dynamically: [+ Voz Principal], [+ Coros], etc. -->
                    </div>
                </div>

                <!-- Lista de puestos asignados -->
                <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">Puestos en el Evento</span>
                        <span id="event-roster-count" class="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">0 puestos</span>
                    </div>
                    <div id="event-form-roster-selection" class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 space-y-2 min-h-[140px] max-h-60 overflow-y-auto">
                        <!-- Populated dynamically with roster slots -->
                    </div>
                </div>
            </div>
        </form>

        <!-- Footer dinámico según paso -->
        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-shrink-0">
            <button type="button" id="btn-event-step-back" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition hidden cursor-pointer">
                <i class="fa-solid fa-arrow-left mr-1.5"></i>Atrás
            </button>
            <button type="button" id="btn-event-cancel" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">Cancelar</button>

            <button type="button" id="btn-event-step-next" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition ml-auto cursor-pointer">
                Continuar a Roster<i class="fa-solid fa-arrow-right ml-1.5"></i>
            </button>
            <button type="submit" form="event-schedule-form" id="btn-submit-event" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition hidden ml-auto cursor-pointer">
                Programar Evento
            </button>
        </div>
    </div>
</div>

<!-- MODAL 2: Ficha / Detalles del Evento -->
<div id="modal-event-detail" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
            <h3 id="event-detail-modal-name" class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">Detalles del Evento</h3>
            <button type="button" id="btn-close-event-detail-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition btn-close-modal">&times;</button>
        </div>

        <div id="event-detail-modal-body" class="overflow-y-auto flex-1 p-5 space-y-4 text-xs text-zinc-700 dark:text-zinc-300">
            <!-- Populated dynamically by JS -->
        </div>

        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-shrink-0">
            <button type="button" id="btn-delete-event" class="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition" style="display: none;">
                <i class="fa-solid fa-trash-can mr-1"></i>Cancelar Evento
            </button>
            <button type="button" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition ml-auto">Cerrar</button>
        </div>
    </div>
</div>

<!-- MODAL 3: Confirmar Eliminar Evento -->
<div id="modal-delete-event-confirm" class="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Cancelar Evento</h3>
            <button type="button" id="btn-close-delete-event-modal-x" class="btn-close-modal w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400">¿Estás seguro de que deseas cancelar el evento <strong id="delete-event-modal-name" class="text-zinc-900 dark:text-zinc-100"></strong>? Esta acción no se puede deshacer.</p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">No, Mantener</button>
                <button type="button" id="btn-confirm-delete-event" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition">Sí, Cancelar Evento</button>
            </div>
        </div>
    </div>
</div>
