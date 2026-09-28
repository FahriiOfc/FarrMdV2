// command/owner/autovn.js

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
    name: 'autovn',
    aliases: [],
    category: 'owner',
    description: 'Toggle auto voice note conversion',
    ownerOnly: true,

    execute(ctx) {
        const arg = ctx.args[0] || '';
        let newValue = parseToggleArg(arg);

        if (newValue === null) {
            newValue = !settings.getValue('autovn');
        }

        const currentValue = settings.getValue('autovn');
        if (newValue === currentValue) {
            return `🎙️ Auto VN *sudah* dalam keadaan ${currentValue ? 'AKTIF' : 'NONAKTIF'}.`;
        }

        settings.set('autovn', newValue);
        return `🎙️ Auto VN berhasil di-${newValue ? 'AKTIFKAN' : 'NONAKTIFKAN'}.`;
    }
};