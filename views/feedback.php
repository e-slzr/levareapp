<!-- Feedback & Bug Report Screen (Levare v1.0 Beta - Minimalist UI - Dual Light & Dark Mode) -->
<div class="space-y-6 screen-fade max-w-2xl mx-auto pb-12">
    
    <!-- Top Back Navigation -->
    <div class="pt-2 flex items-center justify-between">
        <button type="button" onclick="navigateTo('profile')" 
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm cursor-pointer">
            <i class="fa-solid fa-arrow-left text-xs"></i>
            <span>Volver a Perfil</span>
        </button>
    </div>

    <!-- Header -->
    <header class="space-y-1">
        <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Feedback & Soporte</h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
            ¿Encontraste un problema o tienes una sugerencia? Ayúdanos a perfeccionar la experiencia de Levare.
        </p>
    </header>

    <!-- Feedback Submission Form -->
    <form id="feedback-form" onsubmit="handleFeedbackSubmit(event)" class="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
        
        <!-- 1. Category / Type Selector (Pills) -->
        <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Tipo de Reporte
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="feedback-type-selector">
                <button type="button" data-type="bug" onclick="selectFeedbackType('bug')" 
                    class="feedback-type-btn active py-2.5 px-3 rounded-xl border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm">
                    <i class="fa-solid fa-bug text-xs"></i>
                    <span>Error / Bug</span>
                </button>
                <button type="button" data-type="suggestion" onclick="selectFeedbackType('suggestion')" 
                    class="feedback-type-btn py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:border-zinc-400 dark:hover:border-zinc-700 flex items-center justify-center gap-2 transition cursor-pointer">
                    <i class="fa-solid fa-lightbulb text-xs text-amber-500"></i>
                    <span>Sugerencia</span>
                </button>
                <button type="button" data-type="visual" onclick="selectFeedbackType('visual')" 
                    class="feedback-type-btn py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:border-zinc-400 dark:hover:border-zinc-700 flex items-center justify-center gap-2 transition cursor-pointer">
                    <i class="fa-solid fa-display text-xs text-blue-500"></i>
                    <span>Visual / UI</span>
                </button>
                <button type="button" data-type="other" onclick="selectFeedbackType('other')" 
                    class="feedback-type-btn py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:border-zinc-400 dark:hover:border-zinc-700 flex items-center justify-center gap-2 transition cursor-pointer">
                    <i class="fa-solid fa-circle-question text-xs text-purple-500"></i>
                    <span>Otro</span>
                </button>
            </div>
            <input type="hidden" id="feedback-input-type" name="type" value="bug" />
        </div>

        <!-- 2. Title -->
        <div class="space-y-1.5">
            <label for="feedback-input-title" class="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Título o Asunto <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="feedback-input-title" required maxlength="200"
                placeholder="Ej. La vista de presentación de canciones no actualiza el tono transcurrido"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition" />
        </div>

        <!-- 3. Description -->
        <div class="space-y-1.5">
            <label for="feedback-input-description" class="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Descripción Detallada <span class="text-rose-500">*</span>
            </label>
            <textarea id="feedback-input-description" required rows="5"
                placeholder="Describe los pasos para reproducir el fallo, qué estabas haciendo o cualquier sugerencia detallada que nos ayude a solucionarlo..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition resize-none"></textarea>
        </div>

        <!-- 4. Multiple Screenshots Attachment Dropzone -->
        <div class="space-y-2">
            <div class="flex items-center justify-between">
                <label class="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Capturas de Pantalla (Opcional)
                </label>
                <span id="feedback-attachments-counter" class="text-[11px] font-semibold text-zinc-400">
                    0 / 5 capturas
                </span>
            </div>

            <!-- Dropzone Container -->
            <div id="feedback-dropzone" 
                class="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl p-6 text-center transition cursor-pointer">
                
                <input type="file" id="feedback-file-input" multiple accept="image/png, image/jpeg, image/webp" class="hidden" onchange="handleFeedbackFilesSelected(event)" />
                
                <div class="space-y-2 pointer-events-none">
                    <div class="w-10 h-10 rounded-full bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 flex items-center justify-center mx-auto text-sm">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Arrastra tus capturas aquí o <span class="text-zinc-900 dark:text-white underline underline-offset-2">explora archivos</span>
                        </p>
                        <p class="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            Formatos soportados: PNG, JPG, WEBP (Hasta 5 imágenes, máx. 4MB cada una)
                        </p>
                    </div>
                </div>
            </div>

            <!-- Preview Grid for Selected Files -->
            <div id="feedback-attachments-preview" class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 hidden">
                <!-- Dynamically rendered via JS -->
            </div>
        </div>

        <!-- 5. Silent Telemetry Notice -->
        <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 flex items-start gap-3">
            <i class="fa-solid fa-shield-halved text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 flex-shrink-0"></i>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <span class="font-semibold text-zinc-700 dark:text-zinc-300">Diagnóstico técnico automático:</span>
                Al enviar este reporte, se adjuntarán de forma segura los datos de tu dispositivo (sistema operativo, navegador, resolución de pantalla y banda activa) para facilitar la reproducción técnica del problema.
            </div>
        </div>

        <!-- Actions -->
        <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2.5">
            <button type="button" onclick="navigateTo('profile')" 
                class="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                Cancelar
            </button>
            <button type="submit" id="btn-submit-feedback" 
                class="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition flex items-center gap-2 cursor-pointer">
                <i class="fa-solid fa-paper-plane text-xs"></i>
                <span id="btn-submit-feedback-text">Enviar Reporte</span>
            </button>
        </div>

    </form>

</div>
