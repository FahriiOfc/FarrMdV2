// command/owner/autoread.js

import settings from '../../lib/settings.js';

function parseToggleArg(arg) {
    const value = String(arg || '').toLowerCase();
    if (value === 'on' || value === 'true' || value === '1' || value === 'aktif' || value === 'nyala') {
        return true;
    }
    if (value === 'off' || value === 'false' || value === '0' || value === 'nonaktif' || value === 'mati') {
        return false;
    }
    return null; // toggle
}

export default {
    name: 'autoread',
    aliases: [],
    category: 'owner',
    description: 'Toggle auto read messages',
    ownerOnly: true,

    execute(ctx) {
        const arg = ctx.args[0] || '';
        let newValue = parseToggleArg(arg);

        if (newValue === null) {
            newValue = !settings.getValue('autoread');
        }

        const currentValue = settings.getValue('autoread');
        if (newValue === currentValue) {
            return `📖 Auto Read *sudah* dalam keadaan ${currentValue ? 'AKTIF' : 'NONAKTIF'}.`;
        }

        settings.set('autoread', newValue);
        return `📖 Auto Read berhasil di-${newValue ? 'AKTIFKAN' : 'NONAKTIFKAN'}.`;
    }
};