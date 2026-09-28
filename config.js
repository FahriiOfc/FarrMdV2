// config.js
// ESM Configuration for FarrMdV1

export default {
    // =========================================
    // BOT INFORMATION
    // =========================================
    
    ownerNumber: '6285893028915',
    ownerName: 'Owner',
    botName: 'FarrMdV2',
    
    // =========================================
    // PREFIX
    // =========================================
    
    prefix: ['.', '!', '#'],
    
    // =========================================
    // BOT MODE (self / public)
    // =========================================
    
    mode: 'public',
    
    // =========================================
    // SESSION
    // =========================================
    
    sessionName: 'auth',
    
    // =========================================
    // SELF RESPONSE
    // =========================================
    
    selfResponse: true,
    
    // =========================================
    // AUTO READ, AUTO TYPING, AUTO VN
    // =========================================
    
    autoread: false,
    autotyping: false,
    autovn: false,
    
    // =========================================
    // RECONNECT
    // =========================================
    
    reconnect: {
        enabled: true,
        maxAttempts: 5,
        delay: 5000
    },
    
    // =========================================
    // API KEYS
    // =========================================
    
    lolhumanApiKey: 'eddeec5f6f3b2b1ee1948a6a',
    kyzorohanApiKey: 'kyzo_b953238df0ff4123',

    // =========================================
    // PREMIUM SETTINGS (TAMBAHKAN INI)
    // =========================================
    
    premiumMode: false,
    accessDenied: {
        owner: '❌ Fitur ini khusus Owner.',
        creator: '❌ Fitur ini khusus Creator.',
        premium: '❌ Fitur ini khusus Premium. Ketik .checkprem untuk cek status.'
    }
};
