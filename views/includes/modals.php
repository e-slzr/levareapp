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

<!-- 9. Global Loading Overlay -->
<div id="global-loading-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4 select-none">
    <div class="px-6 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center gap-3.5 screen-fade">
        <i class="fa-solid fa-circle-notch fa-spin text-zinc-900 dark:text-zinc-100 text-lg"></i>
        <span id="global-loading-overlay-text" class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Guardando...</span>
    </div>
</div>

<!-- ========================================================================= -->
<!-- MODALES GLOBALES DE INTEGRANTES Y ROLES MUSICALES                         -->
<!-- ========================================================================= -->

<!-- 10. ADD/EDIT MEMBER MODAL -->
<div class="modal-backdrop hidden" id="modal-member">
    <div class="modal-card">
        <div class="modal-header">
            <h3 id="member-modal-title">Agregar Nuevo Integrante</h3>
            <button class="btn-close-modal" id="btn-close-member-modal-x">&times;</button>
        </div>
        <form id="member-form">
            <input type="hidden" id="member-form-id">
            <div class="form-row">
                <div class="form-group col-6">
                    <label for="member-form-name">Nombres</label>
                    <input type="text" id="member-form-name" placeholder="Ej. Juan" required>
                </div>
                <div class="form-group col-6">
                    <label for="member-form-lastname">Apellidos</label>
                    <input type="text" id="member-form-lastname" placeholder="Ej. Pérez" required>
                </div>
            </div>
            <div class="form-group">
                <label for="member-form-email">Correo Electrónico (Opcional)</label>
                <input type="email" id="member-form-email" placeholder="ejemplo@worshipapp.com">
            </div>
            <div class="form-group">
                <label for="member-form-username">Nombre de Usuario (Obligatorio si no tiene email)</label>
                <div style="position:relative;">
                    <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-weight:600;">@</span>
                    <input type="text" id="member-form-username" placeholder="juanperez" required style="padding-left:28px;">
                </div>
                <div id="member-username-feedback" class="field-feedback"></div>
                <small class="form-help">Utilizado para iniciar sesión. Caracteres alfanuméricos simples.</small>
            </div>
            <div class="form-group">
                <label for="member-form-system-role">Rol de Sistema (Permisos)</label>
                <select id="member-form-system-role" required>
                    <option value="member">Miembro (Lectura)</option>
                    <option value="leader">Líder (Control total)</option>
                </select>
            </div>
            <div class="form-group">
                <div class="flex items-center justify-between mb-1.5">
                    <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Instrumentos / Roles Musicales</label>
                    <span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                        <i class="fa-solid fa-star text-amber-400 mr-0.5"></i> Haz clic en la estrella para definir el Principal
                    </span>
                </div>
                <div id="member-roles-selector-container" class="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 min-h-[56px] flex flex-wrap gap-2 items-center">
                    <!-- Populated dynamically with selectable chips -->
                </div>
                <small class="form-help text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">Puedes asignar más de un instrumento. El rol con la estrella será el rol principal en su perfil.</small>
            </div>
            <div class="form-group" id="member-form-password-group">
                <label for="member-form-password">Contraseña Temporal</label>
                <input type="password" id="member-form-password" placeholder="Contraseña de 6+ caracteres" required minlength="6">
                <small class="form-help">Se le pedirá cambiarla en su primer inicio de sesión.</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline btn-close-modal" id="btn-close-member-modal">Cancelar</button>
                <button type="submit" id="btn-member-submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    </div>
</div>

<!-- 11. RESET PASSWORD MODAL -->
<div class="modal-backdrop hidden" id="modal-reset-password">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Restablecer Contraseña</h3>
            <button class="btn-close-modal" id="btn-close-reset-password-modal-x">&times;</button>
        </div>
        
        <!-- Step 1: Confirmation -->
        <div id="reset-password-confirm-step" style="padding: 20px 24px;">
            <input type="hidden" id="reset-password-user-id">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 6px;">Estás por resetear la contraseña del integrante:</p>
            <p style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;" id="reset-password-user-name">...</p>
            <p style="font-size: 0.85rem; color: var(--danger, #ef4444); margin-top: 12px;">Se activará la solicitud de cambio de contraseña obligatoria en su siguiente inicio de sesión.</p>
            
            <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; align-items: center;">
                <button type="button" class="btn btn-outline btn-close-modal" id="btn-close-reset-password-modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="btn-confirm-reset-password">Restablecer</button>
            </div>
        </div>

        <!-- Step 2: Show generated password -->
        <div id="reset-password-success-step" class="hidden" style="padding: 20px 24px;">
            <div style="text-align: center; margin-bottom: 16px; color: #10b981;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-secondary); text-align: center; margin-bottom: 16px;">¡Contraseña restablecida con éxito!</p>
            
            <div class="form-group" style="margin-bottom: 16px;">
                <label for="generated-member-temporary-password">Contraseña Temporal Generada</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="generated-member-temporary-password" readonly style="
                        flex: 1; text-align: center; font-size: 1.25rem; font-weight: 700;
                        letter-spacing: 0.1em; font-family: 'Outfit', monospace; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-main); padding: 8px; border-radius: var(--radius-sm);
                    ">
                    <button class="btn btn-primary" id="btn-copy-member-generated-password" style="padding: 0 16px; display: flex; align-items: center;">
                        Copiar
                    </button>
                </div>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); text-align: center;">Comparte esta contraseña con el integrante. Se le exigirá cambiarla al ingresar.</p>
            
            <div class="modal-footer" style="padding: 16px 0 0; margin-top: 20px;">
                <button type="button" class="btn btn-primary btn-close-modal btn-block" id="btn-close-reset-password-success-modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>

<!-- 12. MANAGE ROLES MODAL -->
<div class="modal-backdrop hidden" id="modal-manage-roles">
    <div class="modal-card">
        <div class="modal-header">
            <h3>Gestionar Roles Musicales</h3>
            <button class="btn-close-modal" id="btn-close-manage-roles-modal-x">&times;</button>
        </div>
        <div class="modal-body">
            <form id="add-role-form" style="display:flex; gap:10px; margin-bottom:20px;">
                <input type="text" id="new-role-input" placeholder="Ej. Saxofón, Sonidista..." required style="flex:1;">
                <button type="submit" class="btn btn-primary">Añadir</button>
            </form>
            
            <h4 style="margin-bottom:10px; font-size:0.9rem;">Roles actuales en tu banda:</h4>
            <div class="scrollable-y max-h-200" id="roles-list-container" style="border:1px solid var(--border-color); border-radius:var(--radius-md); padding:10px; background-color:var(--bg-input);">
                <!-- Populated via JS -->
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-close-modal btn-block" id="btn-close-manage-roles-modal">Cerrar</button>
        </div>
    </div>
</div>

<!-- 13. CONFIRM RESET INVITE CODE MODAL -->
<div class="modal-backdrop hidden" id="modal-confirm-reset-invite-code">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Regenerar Código de Invitación</h3>
            <button class="btn-close-modal" id="btn-close-reset-invite-code-modal-x">&times;</button>
        </div>
        <div style="padding: 20px 24px;">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 6px;">¿Confirmas que deseas generar un nuevo código?</p>
            <p style="font-size: 0.85rem; color: var(--danger, #ef4444); margin-top: 12px;">El código anterior dejará de funcionar inmediatamente. Los nuevos integrantes deberán utilizar el nuevo código para registrarse.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-reset-invite-code">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btn-confirm-reset-invite-code">
                Confirmar Regeneración
            </button>
        </div>
    </div>
</div>

<!-- 14. CONFIRM DELETE MEMBER MODAL -->
<div class="modal-backdrop hidden" id="modal-confirm-delete-member">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Remover Integrante</h3>
            <button class="btn-close-modal" id="btn-close-delete-member-modal-x">&times;</button>
        </div>
        <div style="padding: 20px 24px;">
            <input type="hidden" id="delete-member-user-id">
            <p style="font-size: 0.95rem; color: var(--text-secondary);">¿Estás seguro de que deseas remover a <strong id="delete-member-user-name">...</strong> de tu grupo?</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-delete-member">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btn-confirm-delete-member">Remover</button>
        </div>
    </div>
</div>

<!-- 15. CONFIRM DELETE ROLE MODAL -->
<div class="modal-backdrop hidden" id="modal-confirm-delete-role">
    <div class="modal-card" style="max-width: 450px;">
        <div class="modal-header">
            <h3>Eliminar Rol Musical</h3>
            <button class="btn-close-modal" id="btn-close-delete-role-modal-x">&times;</button>
        </div>
        <div style="padding: 20px 24px;">
            <input type="hidden" id="delete-role-name-input">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 8px;">¿Deseas eliminar el rol "<strong id="delete-role-name-display">...</strong>" de tu banda?</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">Los miembros que tengan este rol conservarán su nombre de rol, pero este ya no figurará para nuevos ingresos.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-delete-role">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btn-confirm-delete-role">Eliminar Rol</button>
        </div>
    </div>
</div>

