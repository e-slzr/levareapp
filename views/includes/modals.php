<!-- Global Shared Modals (Minimalist UI - Dual Light & Dark Mode) -->

<!-- 1. Global Create Group Modal -->
<div id="modal-create-group-global" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Crear Nueva Banda</h3>
            <button type="button" id="btn-close-create-group-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <form id="create-group-form" onsubmit="handleCreateGroupSubmit(event)" class="p-5 space-y-4">
            <div class="space-y-1.5">
                <label for="create-group-name" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nombre de la Banda / Grupo</label>
                <input type="text" id="create-group-name" placeholder="Ej. Los Redoblantes" required class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="space-y-1.5">
                <label for="create-group-description" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Descripción (Opcional)</label>
                <textarea id="create-group-description" placeholder="Ej. Grupo de alabanza congregacional..." class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition h-24 resize-none"></textarea>
            </div>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="submit" id="btn-submit-create-group" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition">Crear Banda</button>
            </div>
        </form>
    </div>
</div>

<!-- 2. Global Join Group Modal -->
<div id="modal-join-group-global" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Unirme a una Banda</h3>
            <button type="button" id="btn-close-join-group-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <form id="join-group-form" onsubmit="handleJoinGroupSubmit(event)" class="p-5 space-y-4">
            <div class="space-y-1.5">
                <label for="join-group-invite-code" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Código de Invitación (6 dígitos)</label>
                <input type="text" id="join-group-invite-code" maxlength="6" placeholder="Ej. 340428" required class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition text-center tracking-widest font-mono text-lg font-bold" />
                <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Pídele al líder de la banda su código numérico de 6 dígitos.</p>
            </div>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="submit" id="btn-submit-join-group" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition">Unirme a la Banda</button>
            </div>
        </form>
    </div>
</div>

<!-- 3. Global Logout Confirm Modal -->
<div id="modal-confirm-logout" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Cerrar Sesión</h3>
            <button type="button" id="btn-close-logout-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400">¿Estás seguro de que deseas cerrar sesión en Levare?</p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" id="btn-confirm-logout" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition">Cerrar Sesión</button>
            </div>
        </div>
    </div>
</div>
