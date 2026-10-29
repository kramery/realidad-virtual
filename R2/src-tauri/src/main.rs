// Esta línea evita que en Windows se abra una ventana negra de consola

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    cepillado_embrujado_lib::run()
}
