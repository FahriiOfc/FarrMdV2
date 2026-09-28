// scraper/alightmotion.js
// Alight Motion Premium Generator

import axios from 'axios';

const API_URL = 'https://dapjimotionpro.my.id/api/proxy-v1';

const HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Android 14; Mobile; rv:154.0) Gecko/154.0 Firefox/154.0',
    'Referer': 'https://dapjimotionpro.my.id/generator'
};

/**
 * Kirim link verifikasi ke email
 */
export async function sendVerification(email) {
    try {
        const { data } = await axios.post(API_URL, {
            action: 'send',
            email: email
        }, { headers: HEADERS });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
}

/**
 * Verifikasi link dari email
 */
export async function verifyLink(email, link) {
    try {
        const { data } = await axios.post(API_URL, {
            action: 'verify',
            email: email,
            link: link
        }, { headers: HEADERS });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
}

export default {
    sendVerification,
    verifyLink
};