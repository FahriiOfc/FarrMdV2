// command/owner/autotyping.js

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
    name: 'autotyping',
    aliases: ['autotype'],
    category: 'owner',
    description: 'Toggle auto typing',
    ownerOnly: true,

    execute(ctx) {
        const arg = ctx.args[0] || '';
        let newValue = parseToggleArg(arg);

        if (newValue === null) {
            newValue = !settings.getValue('autotyping');
        }

        const currentValue = settings.getValue('autotyping');
        if (newValue === currentValue) {
            return `⌨️ Auto Typing *sudah* dalam keadaan ${currentValue ? 'AKTIF' : 'NONAKTIF'}.`;
        }

        settings.set('autotyping', newValue);
        return `⌨️ Auto Typing berhasil di-${newValue ? 'AKTIFKAN' : 'NONAKTIFKAN'}.`;
    }
};