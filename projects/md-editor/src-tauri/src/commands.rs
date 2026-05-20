use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub id: String,
    pub name: String,
    pub path: String,
    pub is_directory: bool,
}

#[command]
pub fn read_directory(dir_path: String) -> Result<Vec<FileEntry>, String> {
    let path = Path::new(&dir_path);

    if !path.exists() {
        return Err(format!("Path does not exist: {}", dir_path));
    }

    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", dir_path));
    }

    let entries = fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))?;

    let mut files: Vec<FileEntry> = entries
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let metadata = entry.metadata().ok()?;
            let file_name = entry.file_name().to_string_lossy().to_string();

            // Skip hidden files on Unix systems
            if file_name.starts_with('.') {
                return None;
            }

            Some(FileEntry {
                id: format!("file-{}", entry.path().to_string_lossy()),
                name: file_name,
                path: entry.path().to_string_lossy().to_string(),
                is_directory: metadata.is_dir(),
            })
        })
        .collect();

    // Sort: directories first, then files alphabetically
    files.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(files)
}

#[command]
pub fn read_file(file_path: String) -> Result<String, String> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err(format!("File does not exist: {}", file_path));
    }

    fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))
}

#[command]
pub fn write_file(file_path: String, content: String) -> Result<(), String> {
    let path = Path::new(&file_path);

    // Create parent directories if they don't exist
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }

    fs::write(path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[command]
pub fn create_file(file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);

    // Create parent directories if they don't exist
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }

    // Create empty file
    fs::write(path, "").map_err(|e| format!("Failed to create file: {}", e))
}

#[command]
pub fn delete_file(file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err(format!("File does not exist: {}", file_path));
    }

    if path.is_dir() {
        fs::remove_dir_all(path).map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(path).map_err(|e| format!("Failed to delete file: {}", e))
    }
}

#[command]
pub fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    let old = Path::new(&old_path);
    let new = Path::new(&new_path);

    if !old.exists() {
        return Err(format!("Path does not exist: {}", old_path));
    }

    fs::rename(old, new).map_err(|e| format!("Failed to rename: {}", e))
}

#[command]
pub fn file_exists(file_path: String) -> bool {
    Path::new(&file_path).exists()
}

#[command]
pub fn is_directory(file_path: String) -> bool {
    Path::new(&file_path).is_dir()
}