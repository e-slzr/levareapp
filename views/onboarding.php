<!-- Onboarding / Group Setup Screen (Minimalist UI) -->
<div class="space-y-6 screen-fade p-2 max-w-md mx-auto">
    <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 text-center">
        <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white text-zinc-950 mx-auto flex items-center justify-center font-bold text-xl shadow-sm">
            +
        </div>
        <div>
            <h2 class="font-serif text-2xl font-bold text-zinc-100">Configuración de Cuenta</h2>
            <p class="text-xs text-zinc-400 mt-1">Para comenzar a usar Levare necesitas pertenecer a una banda o grupo musical.</p>
        </div>

        <!-- Mode Choices -->
        <div class="onboarding-choices space-y-3 pt-2">
            <button type="button" id="btn-choice-create" class="w-full py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition shadow-sm flex items-center justify-center gap-2">
                <i class="fa-solid fa-plus text-sm"></i>
                <span>Crear una nueva banda</span>
            </button>
            <button type="button" id="btn-choice-join" class="w-full py-3 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-200 font-semibold text-sm hover:bg-zinc-800 transition flex items-center justify-center gap-2">
                <i class="fa-solid fa-arrow-right-to-bracket text-sm"></i>
                <span>Unirme con código de invitación</span>
            </button>
        </div>

        <!-- FORM: CREATE GROUP -->
        <form id="form-create-group" class="hidden space-y-4 pt-3 text-left">
            <h3 class="text-sm font-semibold text-zinc-200 border-b border-zinc-800 pb-2">Crear Banda / Grupo</h3>
            <div class="space-y-1">
                <label for="new-group-name" class="text-xs text-zinc-400">Nombre de la Banda</label>
                <input type="text" id="new-group-name" placeholder="Ej. Los Redoblantes" required class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="space-y-1">
                <label for="new-group-desc" class="text-xs text-zinc-400">Descripción (Opcional)</label>
                <textarea id="new-group-desc" rows="3" placeholder="Ej. Banda de rock..." class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition"></textarea>
            </div>
            <div class="flex gap-2 pt-2">
                <button type="button" id="btn-back-to-choices-create" class="w-1/2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-semibold">Cancelar</button>
                <button type="submit" class="w-1/2 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold">Crear Banda</button>
            </div>
        </form>

        <!-- FORM: JOIN GROUP -->
        <form id="form-join-group" class="hidden space-y-4 pt-3 text-left">
            <h3 class="text-sm font-semibold text-zinc-200 border-b border-zinc-800 pb-2">Unirme a Banda</h3>
            <div class="space-y-1">
                <label for="invite-code-input" class="text-xs text-zinc-400">Código de Invitación</label>
                <input type="text" id="invite-code-input" placeholder="Ej. 482951" required maxlength="6" inputmode="numeric" pattern="[0-9]{6}" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="flex gap-2 pt-2">
                <button type="button" id="btn-back-to-choices-join" class="w-1/2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-semibold">Cancelar</button>
                <button type="submit" class="w-1/2 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold">Validar Código</button>
            </div>
        </form>
    </div>
</div>
