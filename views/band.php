<!-- Vista: Gestión de Banda (Solo Líderes y Administradores) -->
<div id="view-band-container" class="space-y-6 screen-fade max-w-4xl mx-auto pb-12">

    <!-- 1. Encabezado de la Banda -->
    <div class="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-3.5">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl flex-shrink-0 font-bold font-serif">
                    <i class="fa-solid fa-users-gear text-lg"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <h2 id="band-view-name" class="font-serif text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Cargando banda...</h2>
                        <span id="band-view-role-badge" class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">Líder</span>
                    </div>
                    <p id="band-view-desc" class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">...</p>
                </div>
            </div>

            <!-- Botones de Acción de Cabecera -->
            <div class="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                <button type="button" onclick="openBandInviteModal()" class="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center cursor-pointer shadow-sm" title="Código de Invitación">
                    <i class="fa-solid fa-share-nodes text-xs pointer-events-none"></i>
                </button>
                <button type="button" onclick="openEditBandInfoModal()" class="w-9 h-9 sm:w-auto sm:px-3.5 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm" title="Editar Información">
                    <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
                    <span class="hidden sm:inline">Editar Información</span>
                </button>
            </div>
        </div>
    </div>

    <!-- 2. Pestañas Segmentadas -->
    <div class="grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold">
        <button type="button" onclick="switchBandTab('members')" id="tab-btn-band-members" class="py-2.5 rounded-xl bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-users text-xs"></i>
            <span>Integrantes</span>
        </button>
        <button type="button" onclick="switchBandTab('cues')" id="tab-btn-band-cues" class="py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-bolt text-xs"></i>
            <span>Mensajes Rápidos</span>
        </button>
        <button type="button" onclick="switchBandTab('danger')" id="tab-btn-band-danger" class="py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-shield-halved text-xs"></i>
            <span>Zona de Peligro</span>
        </button>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 1: INTEGRANTES Y ROLES                                            -->
    <!-- ========================================================================= -->
    <div id="tab-content-band-members" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Directorio de Integrantes</h3>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">Músicos, instrumentos y permisos en este grupo</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
                <button type="button" onclick="openBandRolesModal()" class="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer">
                    <i class="fa-solid fa-music text-xs"></i>
                    <span>Gestionar Instrumentos</span>
                </button>
                <button type="button" onclick="openAddBandMemberModal()" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <i class="fa-solid fa-user-plus text-xs"></i>
                    <span>Agregar Integrante</span>
                </button>
            </div>
        </div>

        <!-- Lista de Integrantes -->
        <div id="band-members-list-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="col-span-full py-8 text-center text-xs text-zinc-400">Cargando integrantes...</div>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 2: MENSAJES RÁPIDOS Y ATANJOS LIVE CUES                            -->
    <!-- ========================================================================= -->
    <div id="tab-content-band-cues" class="hidden space-y-4">
        <div class="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div>
                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Indicaciones Rápidas Personales</h3>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    Personaliza tus mensajes de improvisación silenciosos para el Modo Director. Aparecerán listos en tu panel táctil de repertorios en vivo para transmitirlos a las pantallas de los músicos con un toque.
                </p>
            </div>

            <!-- Formulario para agregar atajo -->
            <form onsubmit="handleCreateBandQuickCue(event)" class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div class="sm:col-span-2">
                        <label class="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Texto de la Indicación</label>
                        <input type="text" id="band-new-cue-title" placeholder="Ej. Repetir coro 2 veces, Bajar a piano, Salida a batería..." required class="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Categoría</label>
                        <select id="band-new-cue-category" class="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500">
                            <option value="Dinámica">Dinámica</option>
                            <option value="Estructura">Estructura</option>
                            <option value="Improvisación">Improvisación</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                </div>

                <div class="flex justify-end pt-1">
                    <button type="submit" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold transition hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-sm">
                        <i class="fa-solid fa-plus text-xs"></i>
                        <span>Guardar Atajo</span>
                    </button>
                </div>
            </form>

            <!-- Lista de Atajos Guardados -->
            <div class="space-y-2 pt-2">
                <h4 class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tus atajos disponibles en esta banda:</h4>
                <div id="band-cues-list-container" class="space-y-2">
                    <div class="text-xs text-zinc-400 text-center py-6">Cargando tus atajos...</div>
                </div>
            </div>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 3: ZONA DE PELIGRO                                                -->
    <!-- ========================================================================= -->
    <div id="tab-content-band-danger" class="hidden space-y-4">
        
        <!-- Salir de la Banda -->
        <div class="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Abandonar Banda</h3>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Dejarás de tener acceso a las canciones, eventos y repertorios de esta agrupación musical.
                    </p>
                </div>
                <button type="button" onclick="openLeaveBandModal()" class="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                    <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                    <span>Salir de la Banda</span>
                </button>
            </div>
        </div>

        <!-- Eliminar Banda (Solo Creador/Superadmin) -->
        <div id="card-delete-band-danger" class="p-5 rounded-3xl border border-red-500/30 bg-red-500/5 dark:bg-red-500/10 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-triangle-exclamation text-red-500 text-sm"></i>
                        <h3 class="text-sm font-bold text-red-600 dark:text-red-400">Eliminar Banda Definitivamente</h3>
                    </div>
                    <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                        Esta acción es irreversible. Se eliminará la banda, su historial, todos los repertorios, canciones privadas y eventos asociados de forma permanente.
                    </p>
                </div>
                <button type="button" onclick="openDeleteBandModal()" class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                    <span>Eliminar Banda</span>
                </button>
            </div>
        </div>
    </div>

</div>

<!-- ========================================================================= -->
<!-- MODALES INTERACTIVOS DE GESTIÓN DE BANDA                                   -->
<!-- ========================================================================= -->

<!-- 1. Modal: Editar Información de la Banda -->
<div id="modal-edit-band-info" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">Editar Información de Banda</h3>
            <button type="button" onclick="closeEditBandInfoModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">
                <i class="fa-solid fa-xmark text-sm pointer-events-none"></i>
            </button>
        </div>
        <form onsubmit="handleUpdateBandInfoSubmit(event)" class="p-5 space-y-4">
            <div>
                <label class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Nombre de la Banda o Grupo</label>
                <input type="text" id="input-edit-band-name" required class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500">
            </div>
            <div>
                <label class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Descripción o Notas</label>
                <textarea id="input-edit-band-desc" rows="3" placeholder="Información sobre la agrupación, iglesia o comunidad musical..." class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"></textarea>
            </div>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeEditBandInfoModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="submit" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold transition hover:opacity-90 shadow-sm">Guardar Cambios</button>
            </div>
        </form>
    </div>
</div>

<!-- 2. Modal: Confirmar Regenerar Código de Invitación -->
<div id="modal-confirm-reset-band-code" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">Regenerar Código</h3>
            <button type="button" onclick="closeResetBandCodeModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                El código anterior dejará de funcionar inmediatamente. Los nuevos miembros deberán usar el nuevo código generado.
            </p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeResetBandCodeModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" onclick="executeResetBandInviteCode()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-sm">Regenerar</button>
            </div>
        </div>
    </div>
</div>

<!-- 3. Modal: Confirmar Eliminar Banda (Requiere escribir el nombre exacto) -->
<div id="modal-confirm-delete-band" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-red-500/40 rounded-3xl shadow-2xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i class="fa-solid fa-triangle-exclamation text-red-500 text-base"></i>
                <h3 class="font-serif text-base font-bold text-red-600 dark:text-red-400">Eliminar Banda</h3>
            </div>
            <button type="button" onclick="closeDeleteBandModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Esta acción es destructiva e irreversible. Para confirmar la eliminación permanente, escribe el nombre exacto de la banda a continuación:
            </p>
            <div class="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                <span id="band-delete-target-name" class="font-bold text-xs text-zinc-900 dark:text-zinc-100 font-mono select-all"></span>
            </div>
            <div>
                <input type="text" id="input-confirm-delete-band-name" placeholder="Escribe el nombre aquí..." class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500">
            </div>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeDeleteBandModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" onclick="executeDeleteBandSubmit()" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm">Eliminar Permanentemente</button>
            </div>
        </div>
    </div>
</div>

<!-- 4. Modal: Confirmar Abandonar Banda -->
<div id="modal-confirm-leave-band" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">Salir de la Banda</h3>
            <button type="button" onclick="closeLeaveBandModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                ¿Estás seguro de que deseas salir de esta banda? Si deseas volver a ingresar, necesitarás un código de invitación.
            </p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeLeaveBandModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" onclick="executeLeaveBandSubmit()" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm">Salir</button>
            </div>
        </div>
    </div>
</div>

<!-- 5. Modal: Código de Invitación (Popup) -->
<div id="modal-band-invite-code" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4" onclick="if(event.target===this)closeBandInviteModal()">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
                    <i class="fa-solid fa-ticket"></i>
                </div>
                <h3 class="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">Código de Invitación</h3>
            </div>
            <button type="button" onclick="closeBandInviteModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">
                <i class="fa-solid fa-xmark text-sm pointer-events-none"></i>
            </button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400 text-center leading-relaxed">
                Comparte este código con los nuevos integrantes para que puedan unirse a la banda desde su cuenta.
            </p>

            <!-- Recuadro del código numérico -->
            <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                <span class="text-[10px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">CÓDIGO ACTIVO</span>
                <div>
                    <span id="band-invite-code-val" class="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-zinc-900 dark:text-zinc-100 select-all">------</span>
                </div>
            </div>

            <!-- Acciones dentro del popup -->
            <div class="grid grid-cols-2 gap-2">
                <button type="button" onclick="copyBandInviteCode()" class="w-full py-2.5 px-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold transition hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                    <i class="fa-solid fa-copy text-xs pointer-events-none"></i>
                    <span>Copiar</span>
                </button>
                <button type="button" onclick="shareBandInviteCode()" class="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <i class="fa-solid fa-share-nodes text-xs pointer-events-none"></i>
                    <span>Compartir</span>
                </button>
            </div>

            <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span class="text-[11px] text-zinc-500 dark:text-zinc-400">¿Deseas renovar el código?</span>
                <button type="button" onclick="openResetInviteCodeModal()" class="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-arrows-rotate text-[10px] pointer-events-none"></i>
                    <span>Regenerar</span>
                </button>
            </div>
        </div>
    </div>
</div>

