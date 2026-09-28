// lib/vpsHelper.js
// VPS Helper - Resolve path aman

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================================
// PATH RESOLVER - AMAN UNTUK AKSES FULL VPS
// ============================================================

export function resolveVPSSafePath(userPath) {
    // Root VPS (akses penuh)
    const ROOT_PATH = '/';
    const PROJECT_ROOT_PATH = PROJECT_ROOT;

    let targetPath = ROOT_PATH;

    if (userPath && userPath.trim().length > 0) {
        const normalized = path.normalize(userPath.trim());
        
        // Jika path dimulai dengan /, gunakan sebagai absolute path
        if (normalized.startsWith('/')) {
            targetPath = normalized;
        } else {
            // Jika relative path, resolve dari project root
            targetPath = path.resolve(PROJECT_ROOT_PATH, normalized);
        }
    }

    // Pastikan path aman (tidak keluar dari root)
    const resolved = path.resolve(targetPath);
    
    // Blacklist path berbahaya
    const dangerous = ['/etc/shadow', '/etc/passwd', '/boot', '/dev'];
    for (const d of dangerous) {
        if (resolved.startsWith(d)) {
            throw new Error(`Akses ke ${d} tidak diizinkan`);
        }
    }

    return resolved;
}

export function isPathAllowed(fullPath) {
    // Tidak boleh mengakses path berbahaya
    const dangerous = ['/etc/shadow', '/etc/passwd', '/boot', '/dev', '/sys', '/proc'];
    for (const d of dangerous) {
        if (fullPath.startsWith(d)) {
            return false;
        }
    }
    return true;
}

export default {
    resolveVPSSafePath,
    isPathAllowed,
    PROJECT_ROOT
};