// =====================================================================
// lib.rs — Arranca la ventana de escritorio.
// No hay nada propio aquí: Tauri abre una ventana y dentro muestra la
// carpeta "src" (nuestra página web). Cómo es la ventana (pantalla
// completa, sin bordes…) se decide en tauri.conf.json.
// [R21] Es el mismo código de la plantilla de "npm create tauri-app@latest", quitando la
//       función de ejemplo "greet" que trae.
// =====================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error al arrancar la aplicación");
}
