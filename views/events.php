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
<div id="modal-schedule-event" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
            <h3 class="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">Programar Nuevo Evento</h3>
            <button type="button" id="btn-close-schedule-event-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition btn-close-modal">&times;</button>
        </div>

        <form id="event-schedule-form" class="overflow-y-auto flex-1 p-5 space-y-4">
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
                <textarea id="event-form-desc" rows="2" placeholder="Notas sobre vestuario, orden especial, etc..."
                    class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition"></textarea>
            </div>

            <div class="space-y-1.5">
                <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Asignar Músicos y Roles (Roster)</label>
                <div id="event-form-roster-selection" class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 space-y-2 max-h-48 overflow-y-auto">
                    <!-- Populated dynamically with roles & members select -->
                </div>
            </div>
        </form>

        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2 flex-shrink-0">
            <button type="button" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
            <button type="submit" form="event-schedule-form" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition">Programar Evento</button>
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
