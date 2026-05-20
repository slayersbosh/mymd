mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_directory,
            commands::read_file,
            commands::write_file,
            commands::create_file,
            commands::delete_file,
            commands::rename_file,
            commands::file_exists,
            commands::is_directory,
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("MyMD - 跨平台 Markdown 编辑器").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}