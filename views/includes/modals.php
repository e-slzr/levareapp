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

<!-- 4. Global Push Notifications Invitation Modal -->
<div id="modal-push-permission-invitation" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden screen-fade p-6 space-y-4 text-center">
        <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mx-auto shadow-sm border border-zinc-200 dark:border-zinc-700">
            <i class="fa-solid fa-bell text-lg"></i>
        </div>
        <div class="space-y-1.5">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Notificaciones en tu Dispositivo</h3>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Entérate al instante cuando tu banda agregue nuevas canciones, programe eventos, cree repertorios o cuando le den like a tus canciones comunitarias.
            </p>
        </div>
        <div class="pt-2 flex flex-col gap-2">
            <button type="button" onclick="acceptPushInvitationModal()" class="w-full py-2.5 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition flex items-center justify-center gap-2">
                <i class="fa-solid fa-check text-xs"></i>
                <span>Activar Notificaciones</span>
            </button>
            <button type="button" onclick="dismissPushInvitationModal()" class="w-full py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                Ahora no
            </button>
        </div>
    </div>
</div>

<!-- 5. Global No Group Alert Modal -->
<div id="modal-no-group-alert" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden screen-fade p-6 space-y-4 text-center">
        <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mx-auto shadow-sm border border-zinc-200 dark:border-zinc-700">
            <i class="fa-solid fa-users-slash text-lg"></i>
        </div>
        <div class="space-y-1.5">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Se requiere una Banda</h3>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                No perteneces a una banda actualmente. Únete o crea una banda nueva desde tu perfil para acceder a esta sección.
            </p>
        </div>
        <div class="pt-2 flex flex-col gap-2">
            <button type="button" onclick="goToProfileFromNoGroupModal()" class="w-full py-2.5 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer">
                <i class="fa-solid fa-user-gear text-xs"></i>
                <span>Ir a Mi Perfil</span>
            </button>
            <button type="button" onclick="closeNoGroupAlertModal()" class="w-full py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                Entendido
            </button>
        </div>
    </div>
</div>

<!-- 6. Announcement Details Modal (Popup interactivo para ver detalles) -->
<div id="modal-announcement-detail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4" onclick="if(event.target === this) closeAnnouncementDetailModal()">
    <div class="w-full max-w-lg max-h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade flex flex-col">
        <!-- Header -->
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div id="announcement-detail-badge-container">
                <!-- Icon and category loaded dynamically -->
            </div>
            <button type="button" onclick="closeAnnouncementDetailModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">&times;</button>
        </div>

        <!-- Scrollable Body -->
        <div class="p-6 overflow-y-auto space-y-4">
            <!-- Date & Time -->
            <p id="announcement-detail-date" class="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"></p>

            <!-- Title -->
            <h2 id="announcement-detail-title" class="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug"></h2>

            <!-- Attached Image Container -->
            <div id="announcement-detail-image-container" class="hidden relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 shadow-sm cursor-zoom-in" onclick="openImageLightbox(document.getElementById('announcement-detail-image').src)">
                <img id="announcement-detail-image" src="" alt="Imagen del anuncio" class="w-full max-h-72 object-cover transition duration-300 group-hover:scale-[1.02]" />
                <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition shadow pointer-events-none">
                    <i class="fa-solid fa-magnifying-glass-plus text-[10px]"></i>
                    <span>Ampliar</span>
                </div>
            </div>


            <!-- Content -->
            <div id="announcement-detail-content" class="text-sm text-zinc-700 dark:text-zinc-300 space-y-3 leading-relaxed">
                <!-- Content paragraphs loaded dynamically -->
            </div>
        </div>

        <!-- Footer -->
        <div id="announcement-detail-footer" class="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-center sm:justify-start text-xs">
            <span class="text-zinc-500 dark:text-zinc-400">Publicado por: <strong id="announcement-detail-author" class="text-zinc-800 dark:text-zinc-200 font-semibold">Eliú Salazar | Desarrollador</strong></span>
        </div>
    </div>
</div>


<!-- 7. Create Global Announcement Modal (Superadmin Only) -->
<div id="modal-create-global-announcement" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4" onclick="if(event.target === this) closeCreateGlobalAnnouncementModal()">
    <div class="w-full max-w-lg max-h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade flex flex-col">
        <!-- Header -->
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center">
                    <i class="fa-solid fa-bullhorn text-sm"></i>
                </div>
                <div>
                    <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Emitir Anuncio Global</h3>
                    <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Publicación oficial y notificación a todos los usuarios</p>
                </div>
            </div>
            <button type="button" onclick="closeCreateGlobalAnnouncementModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">&times;</button>
        </div>

        <!-- Form Form Content -->
        <form id="form-create-global-announcement" onsubmit="handleCreateGlobalAnnouncementSubmit(event)" class="p-6 overflow-y-auto space-y-4">
            <!-- Título -->
            <div class="space-y-1.5">
                <label for="global-announcement-title" class="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <span>Título del Anuncio</span>
                    <span class="text-red-500">*</span>
                </label>
                <input type="text" id="global-announcement-title" required placeholder="Ej. ¡Llegó la versión 2.1 con nuevas funciones!" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>

            <!-- Tipo / Categoría -->
            <div class="space-y-1.5">
                <label for="global-announcement-type" class="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tipo de Anuncio</label>
                <select id="global-announcement-type" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer">
                    <option value="system_announcement">Comunicado General / Aviso</option>
                    <option value="system_update">Actualización / Nueva Versión / Bugs</option>
                    <option value="system_event">Evento Comunitario / Invitación</option>
                </select>
            </div>

            <!-- Contenido -->
            <div class="space-y-1.5">
                <label for="global-announcement-content" class="text-xs font-bold text-zinc-700 dark:text-zinc-300">Contenido / Detalles</label>
                <textarea id="global-announcement-content" rows="4" placeholder="Describe los detalles de la novedad, enlaces o instrucciones para la comunidad..." class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition resize-none"></textarea>
            </div>

            <!-- Adjuntar Imagen -->
            <div class="space-y-1.5">
                <label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Adjuntar Imagen (Opcional)</span>
                    <span class="text-[11px] font-normal text-zinc-400">JPG, PNG, WEBP (Máx. 5MB)</span>
                </label>
                <div class="flex items-center gap-3">
                    <label class="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-2">
                        <i class="fa-solid fa-image text-zinc-500"></i>
                        <span id="global-announcement-image-label">Seleccionar imagen</span>
                        <input type="file" id="global-announcement-image" accept="image/*" onchange="handleAnnouncementImageSelect(event)" class="hidden" />
                    </label>
                    <button type="button" id="btn-remove-announcement-image" onclick="clearAnnouncementImageSelection()" class="text-xs text-red-500 hover:underline hidden">Quitar</button>
                </div>
                <!-- Image Preview -->
                <div id="global-announcement-preview-container" class="hidden mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-48 bg-zinc-100 dark:bg-zinc-950">
                    <img id="global-announcement-preview" src="" alt="Previsualización" class="w-full h-48 object-cover" />
                </div>
            </div>

            <!-- Checkbox Web Push -->
            <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <label class="flex items-start gap-3 cursor-pointer select-none">
                    <input type="checkbox" id="global-announcement-send-push" checked class="mt-0.5 w-4 h-4 rounded text-zinc-900 dark:text-zinc-100 focus:ring-zinc-400 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 transition" />
                    <div>
                        <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200">Enviar Notificación Push a todos los dispositivos</span>
                        <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Los usuarios con notificaciones activadas recibirán un aviso instantáneo en su pantalla.</p>
                    </div>
                </label>
            </div>

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeCreateGlobalAnnouncementModal()" class="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                    Cancelar
                </button>
                <button type="submit" id="btn-submit-global-announcement" class="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition flex items-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-paper-plane text-xs"></i>
                    <span>Publicar y Notificar</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- 8. Image Lightbox Modal (Fullscreen Viewer) -->
<div id="modal-image-lightbox" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md hidden p-4 sm:p-8" onclick="closeImageLightbox()">
    <button type="button" onclick="closeImageLightbox()" class="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-zinc-900/80 text-white hover:bg-zinc-800 flex items-center justify-center text-lg font-bold transition cursor-pointer z-10 shadow-lg border border-zinc-700/50" title="Cerrar imagen">&times;</button>
    <div class="relative max-w-5xl max-h-[90vh] flex items-center justify-center" onclick="event.stopPropagation()">
        <img id="lightbox-image-src" src="" alt="Vista a detalle" class="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl screen-fade" />
    </div>
</div>




