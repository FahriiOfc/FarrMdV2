// plugins/owner/crm.js
// 🔍 CRM by Nixel — Ported to FarrMdV2 ESM
// Commands: crm, crm2, insp, adn, relay, lastchat

import crypto from 'crypto';
import { proto } from '@chaeulso/baileys';
import config from '../../config.js';
import crmstore from '../../lib/crmstore.js';

// ============================================================
// CONSTANTS
// ============================================================

const BOT_NAME = config.botName || 'FarrMdV2';

const ignoredTags = new Set([
    'device-identity', 'quality_control', 'enc', 'hsm',
    'verified_name', 'multicast', 'reporting', 'unavailable', 'rcat'
]);

const ignoredAttributes = new Set([
    'id', 'from', 'to', 'participant', 'recipient', 'type', 'sts',
    'verified_level', 'notify', 'addressing_mode', 'verified_name',
    'participant_pn', 't', 'count'
]);

const SECRET_CONTEXT = {
    EVENT_EDIT: 'Event Edit',
    MESSAGE_EDIT: 'Message Edit',
    POLL_EDIT: 'Poll Edit',
    POLL_ADD_OPTION: 'Poll Edit',
};

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'crm',
    aliases: ['crm2', 'insp', 'adn', 'relay', 'lastchat'],
    category: 'owner',
    description: '🔍 CRM — Extract & relay raw payload',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, args, quoted, react, message, commandName, text } = ctx;

        await react('⏳');

        // commandName dari handler
        const command = commandName || 'crm';
        const textArg = text || args.join(' ');
        const argList = String(textArg || '').trim().split(/\s+/).filter(Boolean);

        // ------------------------------------------------------------
        // LASTAchat
        // ------------------------------------------------------------
        if (command === 'lastchat') {
            const parsed = Number(argList[0] || 10);
            const limit = Math.min(Math.max(Number.isFinite(parsed) ? parsed : 10, 1), 100);

            const rows = getLastChatRows(crmstore, message, limit);

            if (!rows.length) {
                await react('❌');
                return 'Tidak ada pesan yang ditemukan.';
            }

            await react('✅');
            return formatLastChat(rows);
        }

        // ------------------------------------------------------------
        // Parsing #rowid
        // ------------------------------------------------------------
        const rowMatch = argList[0]?.match(/^#(\d+)$/);
        const rowid = rowMatch ? Number(rowMatch[1]) : null;

        let chatId;
        let targetId;
        let msgSource;
        let rmsg;

        if (rowid !== null) {
            const row = crmstore.db.prepare(
                `SELECT rowid, id, chat, sender, timestamp, data
                 FROM messages WHERE rowid = ? LIMIT 1`
            ).get(rowid);

            if (!row) {
                await react('❌');
                return `Message dengan rowid #${rowid} tidak ditemukan.`;
            }

            try {
                rmsg = proto.WebMessageInfo.toObject(
                    proto.WebMessageInfo.decode(row.data),
                    { enums: Number, longs: Number, bytes: String, defaults: false }
                );
            } catch (e) {
                await react('❌');
                return `Gagal decode rowid #${rowid}:\n${e.message}`;
            }

            chatId = row.chat;
            targetId = row.id;
            msgSource = `rowid:${rowid}`;
        } else {
            if (!quoted) {
                await react('❌');
                return `📌 *.${command}* butuh pesan yang di-reply.

*Command:*
• .crm → Generate file relay dari pesan
• .crm #rowid → Relay dari SQLite
• .crm2 → Raw + relay via tombol
• .adn → Ambil AdditionalNodes
• .insp → Raw payload JSON
• .relay → Relay ulang + child
• .lastchat <n> → Pesan terakhir

*Flags:*
• -raw • -message • -relay • -file • -snip
• -nofilter • -nochild • -noproto`;
            }

            chatId = quoted.key?.remoteJid || chat;
            targetId = quoted.key?.id;

            // Cari dari crmstore
            const stored = crmstore.loadMessage(targetId, chatId);
            rmsg = stored || quoted.message;
            msgSource = stored ? 'crmstore' : 'quoted';
        }

        let msg;
        if (rmsg) {
            msg = await normalizeMessage(rmsg, crmstore, chatId);
        }

        if (!msg?.message) {
            await react('❌');
            return `⛓️‍💥 Message tidak valid (${typeof msg?.message})`;
        }

        const messageId = msg.key?.id || targetId;
        const rawNode = loadBestNode(crmstore, messageId, chatId, msg);
        const nodeAttrs = getNodeAttributes(rawNode);
        const nodeContent = getNodeContent(rawNode);

        const type = Object.keys(msg.message)
            .find(v => !['messageContextInfo', 'senderKeyDistributionMessage'].includes(v)) || 'unknown';

        const additionalNodes = filterAdditionalNodes(nodeContent);
        const relayOptions = getRelayOptions(rawNode);

        const parentSender = getSenderIdentity(msg.key);

        const noChild = textArg.includes('-nochild');
        const noProto = textArg.includes('-noproto');

        const stats = { fails: 0 };

        const childTree = noChild ? [] : await buildChildTree(
            crmstore, chatId, messageId, parentSender, 50, 0, 5, new Set(), !noProto, stats
        );

        // ------------------------------------------------------------
        // RELAY
        // ------------------------------------------------------------
        if (command === 'relay') {
            const newParentId = await sock.relayMessage(
                chat, structuredClone(msg.message), relayOptions
            );
            await relayChildTree(sock, chat, childTree, newParentId);
            await react('✅');
            return newParentId;
        }

        const rawPayload = {
            message: msg,
            node: rawNode,
            additionalAttributes: nodeAttrs,
            additionalNodes,
        };

        const raw = stringify(rawPayload);
        const messageStr = stringify(msg.message);
        const keyStr = stringify(msg.key);
        const optionsStr = stringifySnippet(relayOptions);

        const participant = msg.key?.remoteJid || msg.key?.participant || msg.key?.participantAlt || '-';
        const msgId = msg.key?.id || targetId || '-';

        const snippetMessage = stringifySnippet(msg.message);
        const relayCode = buildRelayScript(snippetMessage, stringifySnippet(relayOptions), childTree);

        const files = {
            raw,
            message: messageStr,
            relay: relayCode,
        };

        const exportType = ['raw', 'message', 'relay'].find(v => textArg.includes(`-${v}`));

        if (exportType) {
            if (textArg.includes('-file')) {
                await sock.sendMessage(chat, {
                    document: Buffer.from(files[exportType]),
                    fileName: exportType === 'relay' ? `${type}.js` : `${exportType}.json`,
                    mimetype: exportType === 'relay' ? 'application/javascript' : 'application/json'
                }, { quoted: message });
                await react('✅');
                return;
            }

            await react('✅');
            return files[exportType];
        }

        const isSnip = textArg.includes('-snip');

        const formatChat = (c) => !c ? '-' : (isSnip ? `${c.slice(0, 7)}.....${c.split('@')[1] || ''}` : c);
        const formatId = (id) => !id ? '-' : (isSnip ? `${id.slice(0, 7)}.....` : id);

        const childrenCount = countTree(childTree);
        const childrenLine = stats.fails ? `${childrenCount} (${stats.fails} fail)` : `${childrenCount}`;

        const sender = msg.key?.participant || msg.key?.participantAlt || msg.key?.remoteJid || quoted?.sender || '-';
        const nodeChat = rawNode?.attrs?.from || rawNode?.attrs?.to || rawNode?.attrs?.recipient || '-';

        const metadata = `• Type     : ${type}
• Source   : ${msgSource || '-'}
• Chat     : ${formatChat(chatId)}
• Node Chat: ${formatChat(nodeChat)}
• ID       : ${formatId(messageId)}
• Node ID  : ${formatId(rawNode?.attrs?.id || '-')}
• Sender   : ${sender.split('@')[0]}
• Node Tag : ${rawNode?.tag || '-'}
• Attrs    : ${Object.keys(nodeAttrs).length}
• Children : ${childrenLine}`;

        // ------------------------------------------------------------
        // INSP
        // ------------------------------------------------------------
        if (command === 'insp') {
            const inspPayload = attachChildren(rawPayload, childTree);

            if (isSnip) {
                const imsg = stringify(inspPayload);
                if (imsg.length > 20000) {
                    await react('❌');
                    return 'Payload terlalu besar untuk snip.';
                }

                const { AIRich } = await import('../../lib/MessageBuilder.js');
                await new AIRich(sock)
                    .addText('# 📥️ Raw Snippet')
                    .addMetadata(metadata)
                    .addSuggest([type, chatId, messageId])
                    .addCode('javascript', imsg)
                    .send(chat, { quoted: message, includesSubmessages: false });

                await react('✅');
                return;
            }

            await sock.sendMessage(chat, {
                document: Buffer.from(stringify(inspPayload)),
                fileName: `${type}.json`,
                mimetype: 'application/json',
                caption: metadata
            }, { quoted: message });
            await react('✅');
            return;
        }

        const adn = textArg.includes('-nofilter')
            ? additionalNodes
            : filterAdditionalNodes(additionalNodes);

        // ------------------------------------------------------------
        // CRM
        // ------------------------------------------------------------
        if (command === 'crm') {
            if (isSnip) {
                if (relayCode.length > 20000) {
                    await react('❌');
                    return 'Payload terlalu besar untuk snip.';
                }

                const { AIRich } = await import('../../lib/MessageBuilder.js');
                await new AIRich(sock)
                    .addText('# ⚡ Relay Snippet')
                    .addMetadata(metadata)
                    .addSuggest([type, chatId, messageId])
                    .addCode('javascript', relayCode)
                    .send(chat, { quoted: message, includesSubmessages: false });

                await react('✅');
                return;
            }

            await sock.sendMessage(chat, {
                document: Buffer.from(relayCode),
                fileName: `${type}.js`,
                mimetype: 'application/javascript',
                caption: metadata
            }, { quoted: message });
            await react('✅');
            return;
        }

        // ------------------------------------------------------------
        // ADN
        // ------------------------------------------------------------
        if (command === 'adn') {
            if (!adn.length) {
                await react('❌');
                return 'No AdditionalNodes captured 📷';
            }

            if (isSnip) {
                const { AIRich } = await import('../../lib/MessageBuilder.js');
                await new AIRich(sock)
                    .addText('# 📸 AdditionalNode Captured')
                    .addMetadata(metadata)
                    .addSuggest([type, chatId, messageId])
                    .addCode('javascript', stringifySnippet(adn))
                    .send(chat, { quoted: message });
                await react('✅');
                return;
            }

            await sock.sendMessage(chat, {
                document: Buffer.from(stringify(adn)),
                fileName: 'additionalNodes.json',
                mimetype: 'application/json'
            }, { quoted: message });
            await react('✅');
            return;
        }

        // ------------------------------------------------------------
        // CRM2 — Tombol interaktif
        // ------------------------------------------------------------
        if (command === 'crm2') {
            const { Button } = await import('../../lib/MessageBuilder.js');

            const btn = new Button(sock);
            btn.setTitle(capitalize(type));
            btn.setBody(metadata + '\n\n' + raw);
            btn.setMedia({
                document: Buffer.from(relayCode),
                mimetype: 'application/javascript',
                fileName: `${type}.js`
            });
            btn.setParams({
                limited_time_offer: {
                    text: 'Create Relay Message',
                    url: 'https://wa.me/6285893028915',
                    copy_code: BOT_NAME,
                    expiration_time: Date.now() + 60000
                },
                bottom_sheet: {
                    in_thread_buttons_limit: 3,
                    divider_indices: [1, 2, 3, 4, 5, 6],
                    list_title: 'Payload Options',
                    button_title: 'Other'
                }
            });
            btn.addCopy('Copy Full Raw', raw);
            btn.addCopy('Copy Relay Code', relayCode);
            btn.addCopy('Copy Payload', messageStr);
            btn.addCopy('Copy Key', keyStr);
            btn.addCopy('Copy Sender', participant);
            btn.addCopy('Copy Message ID', msgId);
            btn.addCopy('Copy Options', optionsStr);

            await btn.send(chat, { quoted: message });
            await react('✅');
            return;
        }
    }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function loadBestNode(crmstore, messageId, chatId, msg) {
    if (!crmstore || !messageId) return null;

    let node = null;
    try { node = crmstore.loadNode(messageId, chatId); } catch {}
    if (node) return node;

    const altChats = [
        chatId, msg?.key?.remoteJid, msg?.key?.remoteJidAlt,
        msg?.key?.participant, msg?.key?.participantAlt,
        msg?.key?.senderPn, msg?.key?.senderLid
    ].filter(Boolean);

    for (const jid of [...new Set(altChats)]) {
        if (jid === chatId) continue;
        try { node = crmstore.loadNode(messageId, jid); } catch {}
        if (node) return node;
    }

    try { return crmstore.loadNode(messageId); } catch {}
    return null;
}

function getNodeAttributes(node) {
    if (!node?.attrs || typeof node.attrs !== 'object' || Array.isArray(node.attrs)) return {};
    const attrs = { ...node.attrs };
    for (const key of ignoredAttributes) delete attrs[key];
    return attrs;
}

function getNodeContent(node) {
    if (!node || !Array.isArray(node.content)) return [];
    return node.content;
}

function normalizeMessage(rmsg, crmstore, chat) {
    const normalized = proto.WebMessageInfo.toObject(
        proto.WebMessageInfo.fromObject(rmsg),
        { enums: Number, longs: Number, bytes: String, defaults: false }
    );
    return decryptSecretEnvelope(normalized, crmstore, chat);
}

async function decryptSecretEnvelope(msg, crmstore, chat) {
    const secret = msg?.message?.secretEncryptedMessage;
    if (!secret) return msg;

    const type = secretEncTypeName(secret.secretEncType);
    if (!['MESSAGE_EDIT', 'EVENT_EDIT', 'POLL_EDIT', 'POLL_ADD_OPTION'].includes(type)) return msg;

    const targetKey = secret.targetMessageKey;
    if (!targetKey?.id) return msg;

    const target = loadTargetSecret(crmstore, chat, targetKey);
    if (!target) return msg;

    const decrypted = decryptSecretMessage(secret, target, type);
    if (!decrypted) return msg;

    return { ...msg, message: decrypted };
}

function getSenderIdentity(key) {
    if (!key) return { me: false, jids: new Set() };
    if (key.fromMe) return { me: true, jids: new Set() };
    const jids = new Set([key.participant, key.participantAlt].filter(Boolean));
    if (!jids.size && key.remoteJid) jids.add(key.remoteJid);
    return { me: false, jids };
}

function sameSender(a, b) {
    if (!a || !b) return false;
    if (a.me || b.me) return a.me && b.me;
    for (const jid of a.jids) if (b.jids.has(jid)) return true;
    return false;
}

function collectDeepKeys(node, depth = 0, maxDepth = 12, out = []) {
    if (!node || typeof node !== 'object' || depth > maxDepth) return out;
    if (node.protocolMessage?.key) out.push(node.protocolMessage.key);
    if (node.secretEncryptedMessage?.targetMessageKey) out.push(node.secretEncryptedMessage.targetMessageKey);
    for (const value of Object.values(node)) {
        if (value && typeof value === 'object') collectDeepKeys(value, depth + 1, maxDepth, out);
    }
    return out;
}

function collectSecretMessages(node, depth = 0, maxDepth = 12, out = []) {
    if (!node || typeof node !== 'object' || depth > maxDepth) return out;
    if (node.secretEncryptedMessage) out.push(node.secretEncryptedMessage);
    for (const value of Object.values(node)) {
        if (value && typeof value === 'object') collectSecretMessages(value, depth + 1, maxDepth, out);
    }
    return out;
}

function findMessageSecret(node, depth = 0, maxDepth = 12) {
    if (!node || typeof node !== 'object' || depth > maxDepth) return null;
    if (node.messageContextInfo?.messageSecret) return node.messageContextInfo.messageSecret;
    for (const value of Object.values(node)) {
        if (value && typeof value === 'object') {
            const found = findMessageSecret(value, depth + 1, maxDepth);
            if (found) return found;
        }
    }
    return null;
}

function loadTargetSecret(crmstore, chat, targetKey) {
    try {
        const row = crmstore.loadMessage(targetKey.id, chat);
        if (!row) return null;

        const normalized = proto.WebMessageInfo.toObject(
            proto.WebMessageInfo.fromObject(row),
            { enums: Number, longs: Number, bytes: String, defaults: false }
        );

        const secretB64 = findMessageSecret(normalized.message);
        if (!secretB64) return null;

        const key = normalized.key || {};
        const senderJid = key.participant || targetKey.participant || key.remoteJid || targetKey.remoteJid;
        if (!senderJid) return null;

        return {
            messageSecret: Buffer.from(secretB64, 'base64'),
            senderJid
        };
    } catch {
        return null;
    }
}

function secretEncTypeName(value) {
    if (typeof value === 'string') return value;
    try {
        return proto.Message.SecretEncryptedMessage.SecretEncType[value] ?? value;
    } catch {
        return value;
    }
}

function getSecretContext(type) { return SECRET_CONTEXT[type] || null; }

function decryptSecretMessage(secretMsg, target, type) {
    try {
        const targetId = secretMsg?.targetMessageKey?.id;
        if (!targetId || !secretMsg?.encPayload || !secretMsg?.encIv || !target?.messageSecret) return null;

        const context = getSecretContext(type);
        if (!context) return null;

        const messageSecret = target.messageSecret;
        if (messageSecret.length !== 32) return null;

        const senderJid = target.senderJid;
        const info = Buffer.concat([
            Buffer.from(targetId, 'utf8'),
            Buffer.from(senderJid, 'utf8'),
            Buffer.from(senderJid, 'utf8'),
            Buffer.from(context, 'utf8')
        ]);

        const key = crypto.hkdfSync('sha256', messageSecret, Buffer.alloc(0), info, 32);
        const encPayload = Buffer.from(secretMsg.encPayload, 'base64');
        const encIv = Buffer.from(secretMsg.encIv, 'base64');

        if (encIv.length !== 12 || encPayload.length < 16) return null;

        const authTag = encPayload.subarray(-16);
        const ciphertext = encPayload.subarray(0, -16);

        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), encIv);
        decipher.setAuthTag(authTag);

        const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        const decoded = proto.Message.decode(plaintext);

        return proto.Message.toObject(decoded, {
            enums: Number, longs: Number, bytes: String, defaults: false
        });
    } catch {
        return null;
    }
}

async function decryptChildMessage(crmstore, chat, msgObj) {
    const secrets = collectSecretMessages(msgObj);
    if (!secrets.length) return { message: msgObj, fails: 0 };

    let current = msgObj;
    let fails = 0;

    for (const secretMsg of secrets) {
        const targetKey = secretMsg?.targetMessageKey;
        if (!targetKey?.id) { fails++; continue; }

        const target = loadTargetSecret(crmstore, chat, targetKey);
        if (!target) { fails++; continue; }

        const type = secretEncTypeName(secretMsg.secretEncType);
        const decrypted = decryptSecretMessage(secretMsg, target, type);
        if (!decrypted) { fails++; continue; }

        current = replaceSecretEnvelope(current, secretMsg, decrypted);
    }

    return { message: current, fails };
}

function replaceSecretEnvelope(node, targetSecret, decrypted) {
    if (!node || typeof node !== 'object') return node;
    if (node.secretEncryptedMessage === targetSecret) return decrypted;
    if (node.secretEncryptedMessage && sameSecretEnvelope(node.secretEncryptedMessage, targetSecret)) return decrypted;
    if (Array.isArray(node)) return node.map(v => replaceSecretEnvelope(v, targetSecret, decrypted));

    const out = { ...node };
    for (const [key, value] of Object.entries(out)) {
        if (value && typeof value === 'object') out[key] = replaceSecretEnvelope(value, targetSecret, decrypted);
    }
    return out;
}

function sameSecretEnvelope(a, b) {
    return a?.targetMessageKey?.id === b?.targetMessageKey?.id
        && a?.encPayload === b?.encPayload
        && a?.encIv === b?.encIv
        && a?.secretEncType === b?.secretEncType;
}

function getParentKey(key, chat) {
    if (!key?.id) return null;
    return {
        id: key.id,
        remoteJid: key.remoteJid || chat,
        fromMe: !!key.fromMe,
        participant: key.participant,
        participantAlt: key.participantAlt
    };
}

function matchesParentKey(keyObj, parentKey, chat) {
    if (!keyObj || !parentKey) return false;
    if (!keyObj.id || keyObj.id !== parentKey.id) return false;
    const keyRemoteJid = keyObj.remoteJid || keyObj.remoteJidAlt;
    const parentRemoteJid = parentKey.remoteJid || chat;
    if (keyRemoteJid && parentRemoteJid && keyRemoteJid !== parentRemoteJid) return false;
    return true;
}

async function findDirectChildren(crmstore, chat, parentId, parentSender, radius = 50, useProto = true) {
    const base = crmstore.db.prepare(
        `SELECT timestamp, data FROM messages WHERE id = ? AND chat = ? LIMIT 1`
    ).get(parentId, chat);

    if (!base) return [];

    let parentMessage;
    try {
        parentMessage = proto.WebMessageInfo.toObject(
            proto.WebMessageInfo.decode(base.data),
            { enums: Number, longs: Number, bytes: String, defaults: false }
        );
    } catch { return []; }

    const parentKey = getParentKey(parentMessage.key, chat);
    if (!parentKey) return [];

    const older = crmstore.db.prepare(
        `SELECT id, data FROM messages WHERE chat = ? AND timestamp <= ? ORDER BY timestamp DESC LIMIT ?`
    ).all(chat, base.timestamp, radius);

    const newer = crmstore.db.prepare(
        `SELECT id, data FROM messages WHERE chat = ? AND timestamp > ? ORDER BY timestamp ASC LIMIT ?`
    ).all(chat, base.timestamp, radius);

    const children = [];

    for (const row of [...older, ...newer]) {
        if (row.id === parentId) continue;

        let decoded;
        try {
            decoded = proto.WebMessageInfo.toObject(
                proto.WebMessageInfo.decode(row.data),
                { enums: Number, longs: Number, bytes: String, defaults: false }
            );
        } catch { continue; }

        const assocKey = decoded?.message?.messageContextInfo?.messageAssociation?.parentMessageKey;
        const matchedAssoc = matchesParentKey(assocKey, parentKey, chat);
        const matchedDeep = useProto ? collectDeepKeys(decoded?.message).some(k => matchesParentKey(k, parentKey, chat)) : false;

        if (!matchedAssoc && !matchedDeep) continue;
        children.push(decoded);
    }

    return children;
}

async function buildChildTree(crmstore, chat, parentId, parentSender, radius = 50, depth = 0, maxDepth = 5, visited = new Set(), useProto = true, stats = { fails: 0 }) {
    if (depth >= maxDepth) return [];

    const visitKey = `${chat}:${parentId}:${serializeSender(parentSender)}`;
    if (visited.has(visitKey)) return [];
    visited.add(visitKey);

    const rawChildren = await findDirectChildren(crmstore, chat, parentId, parentSender, radius, useProto);
    const result = [];

    for (const rawChild of rawChildren) {
        const normalized = await normalizeMessage(rawChild, crmstore, chat);
        const decrypted = await decryptChildMessage(crmstore, chat, normalized.message);
        stats.fails += decrypted.fails;

        const finalRaw = { ...normalized, message: decrypted.message };
        const msg = unwrapAssociatedChild(finalRaw);
        if (!msg?.key?.id || !msg?.message) continue;

        const childId = msg.key.id;
        const childSender = getSenderIdentity(msg.key);
        const childNode = loadBestNode(crmstore, childId, chat, msg);
        const relayOptions = getRelayOptions(childNode);
        const children = await buildChildTree(crmstore, chat, childId, childSender, radius, depth + 1, maxDepth, visited, useProto, stats);

        result.push({ raw: finalRaw, node: childNode, msg, relayOptions, children });
    }

    return result;
}

function serializeSender(sender) {
    if (!sender) return '';
    if (sender.me) return 'me';
    return [...sender.jids].sort().join(',');
}

async function relayChildTree(conn, chat, nodes, parentId) {
    for (const node of nodes) {
        const message = structuredClone(node.msg.message);
        const assoc = message?.messageContextInfo?.messageAssociation;
        if (assoc?.parentMessageKey) {
            assoc.parentMessageKey.id = parentId;
            assoc.parentMessageKey.remoteJid = chat;
            assoc.parentMessageKey.fromMe = true;
        }

        const protocolKeys = collectProtocolKeys(message);
        for (const key of protocolKeys) {
            key.id = parentId;
            key.remoteJid = chat;
            key.fromMe = true;
        }

        const options = { ...node.relayOptions };
        const newChildId = await conn.relayMessage(chat, message, options);
        await relayChildTree(conn, chat, node.children, newChildId);
    }
}

function collectProtocolKeys(node, depth = 0, maxDepth = 12, out = []) {
    if (!node || typeof node !== 'object' || depth > maxDepth) return out;
    if (node.protocolMessage?.key) out.push(node.protocolMessage.key);
    for (const value of Object.values(node)) {
        if (value && typeof value === 'object') collectProtocolKeys(value, depth + 1, maxDepth, out);
    }
    return out;
}

function filterAdditionalNodes(nodes) {
    return (nodes || []).filter(v => !ignoredTags.has(v?.tag));
}

function getRelayOptions(node = null) {
    const additionalAttributes = getNodeAttributes(node);
    const additionalNodes = filterAdditionalNodes(getNodeContent(node));
    const options = {};
    if (Object.keys(additionalAttributes).length) options.additionalAttributes = additionalAttributes;
    if (additionalNodes.length) options.additionalNodes = additionalNodes;
    return options;
}

function countTree(nodes) {
    return nodes.reduce((sum, node) => sum + 1 + countTree(node.children), 0);
}

function attachChildren(base, tree) {
    if (!tree.length) return base;
    return {
        ...base,
        __children: tree.map(node => {
            const child = attachChildren(node.raw, node.children);
            if (node.node) return { ...child, __node: node.node };
            return child;
        })
    };
}

function unwrapAssociatedChild(msg) {
    const contextInfo = msg?.message?.messageContextInfo;
    const inner = msg?.message?.associatedChildMessage?.message;
    if (!inner) return msg;
    return { ...msg, message: { ...inner, messageContextInfo: contextInfo } };
}

function findBlockEnd(str, openIndex) {
    let depth = 0;
    for (let i = openIndex; i < str.length; i++) {
        if (str[i] === '{') depth++;
        if (str[i] === '}') { depth--; if (depth === 0) return i; }
    }
    return -1;
}

function injectKeyBlock(snippet, marker, parentIdExpr) {
    const start = snippet.indexOf(marker);
    if (start === -1) return snippet;

    const braceIndex = start + marker.length - 1;
    const end = findBlockEnd(snippet, braceIndex);
    if (end === -1) return snippet;

    const indentMatch = snippet.slice(0, start).match(/([ \t]*)$/);
    const indent = indentMatch ? indentMatch[1] : '';

    const replacement = `${marker.slice(0, -1)}{
${indent}  remoteJid: m.chat,
${indent}  fromMe: true,
${indent}  id: ${parentIdExpr}
${indent}}`;

    return snippet.slice(0, start) + replacement + snippet.slice(end + 1);
}

function injectParentKey(snippet, parentIdExpr = 'newParentId') {
    return injectKeyBlock(snippet, 'parentMessageKey: {', parentIdExpr);
}

function injectTargetKey(snippet, parentIdExpr = 'newParentId') {
    return injectKeyBlock(snippet, 'targetMessageKey: {', parentIdExpr);
}

function injectProtocolKey(snippet, parentIdExpr = 'newParentId') {
    const marker = 'protocolMessage: {';
    const start = snippet.indexOf(marker);
    if (start === -1) return snippet;

    const braceIndex = start + marker.length - 1;
    const blockEnd = findBlockEnd(snippet, braceIndex);
    if (blockEnd === -1) return snippet;

    const before = snippet.slice(0, start);
    const block = snippet.slice(start, blockEnd + 1);
    const after = snippet.slice(blockEnd + 1);
    const patchedBlock = injectKeyBlock(block, 'key: {', parentIdExpr);

    return before + patchedBlock + after;
}

function buildChildScript(nodes, parentVar, path = []) {
    const blocks = [];

    nodes.forEach((node, i) => {
        const varName = `id_${[...path, i].join('_')}`;
        const rawChildSnippet = stringifySnippet(node.msg.message);

        let childSnippet = injectParentKey(rawChildSnippet, parentVar);
        childSnippet = injectProtocolKey(childSnippet, parentVar);
        childSnippet = injectTargetKey(childSnippet, parentVar);

        const childOptions = stringifySnippet(node.relayOptions);

        blocks.push(`const ${varName} = await conn.relayMessage(
  m.chat,
  ${indentBlock(childSnippet)},
  ${indentBlock(childOptions)}
);`);

        if (node.children.length) {
            blocks.push(...buildChildScript(node.children, varName, [...path, i]));
        }
    });

    return blocks;
}

function buildRelayScript(snippetMessage, options, childTree) {
    if (!childTree.length) {
        return `=> conn.relayMessage(
  m.chat,
  ${indentBlock(snippetMessage)},
  ${indentBlock(options)}
)`;
    }

    const parentBlock = `const newParentId = await conn.relayMessage(
  m.chat,
  ${indentBlock(snippetMessage)},
  ${indentBlock(options)}
);`;

    const childBlocks = buildChildScript(childTree, 'newParentId');

    return '> ' + [parentBlock, ...childBlocks, 'return newParentId;'].join('\n\n');
}

function getTimestampFromMessage(message) {
    if (!message) return 0;
    if (typeof message.messageTimestamp === 'number') return message.messageTimestamp;
    if (typeof message.messageTimestamp === 'object' && message.messageTimestamp !== null) {
        return Number(message.messageTimestamp.low ?? message.messageTimestamp);
    }
    return 0;
}

function getReferenceMessage(m, crmstore) {
    const chatId = m.quoted?.key?.remoteJid || m.chat;
    const messageId = m.quoted?.key?.id;

    if (messageId) {
        const row = crmstore.db.prepare(
            `SELECT timestamp FROM messages WHERE id = ? AND chat = ? LIMIT 1`
        ).get(messageId, chatId);

        if (row) return { chat: chatId, timestamp: Number(row.timestamp) || 0 };
    }

    return {
        chat: chatId,
        timestamp: getTimestampFromMessage(m) || Math.floor(Date.now() / 1000)
    };
}

function getLastChatRows(crmstore, m, limit) {
    const reference = getReferenceMessage(m, crmstore);
    if (!reference.timestamp) return [];

    return crmstore.db.prepare(
        `SELECT rowid, id, chat, sender, timestamp, data
         FROM messages WHERE chat = ? AND timestamp <= ?
         ORDER BY timestamp DESC, rowid DESC LIMIT ?`
    ).all(reference.chat, reference.timestamp, limit).reverse();
}

function getMessageType(message) {
    if (!message) return '-';
    return Object.keys(message)
        .find(v => !['messageContextInfo', 'senderKeyDistributionMessage'].includes(v)) || '-';
}

function getPreviewText(message) {
    if (!message) return '-';
    if (typeof message.conversation === 'string') return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage) return message.imageMessage.caption ? `📷 ${message.imageMessage.caption}` : '📷 Image';
    if (message.videoMessage) return message.videoMessage.caption ? `🎥 ${message.videoMessage.caption}` : '🎥 Video';
    if (message.audioMessage) return '🎵 Audio';
    if (message.stickerMessage) return '🎨 Sticker';
    if (message.documentMessage) return message.documentMessage.fileName || '📄 Document';
    if (message.reactionMessage) return `💬 Reaction ${message.reactionMessage.text || ''}`.trim();
    if (message.protocolMessage) {
        const type = message.protocolMessage.type;
        if (type === proto.Message.ProtocolMessage.Type.REVOKE) return '🗑️ Revoke';
        if (type === proto.Message.ProtocolMessage.Type.MESSAGE_EDIT) return '✏️ Edit';
        return `⚙️ Protocol ${type}`;
    }
    if (message.secretEncryptedMessage) return '🔐 SecretEncryptedMessage';
    return getMessageType(message);
}

function getDisplaySender(message, row) {
    const key = message?.key || {};
    if (key.fromMe) return 'Me';
    return key.participantAlt || key.participant || row?.sender || key.remoteJid || 'Unknown';
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '--:--:--';
    const date = new Date(Number(timestamp) * 1000);
    if (Number.isNaN(date.getTime())) return '--:--:--';

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'Asia/Jakarta'
    }).format(date);
}

function formatLastChat(rows) {
    const lines = [`╭─〔 LAST CHAT • ${rows.length} PESAN 〕`, '│'];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let message;
        try {
            message = proto.WebMessageInfo.toObject(
                proto.WebMessageInfo.decode(row.data),
                { enums: Number, longs: Number, bytes: String, defaults: false }
            );
        } catch { message = null; }

        const type = getMessageType(message?.message);
        const sender = getDisplaySender(message, row);
        const preview = getPreviewText(message?.message);

        lines.push(`│ ${String(i + 1).padStart(2, '0')}  ${formatTimestamp(row.timestamp)}  ${sender}`);
        lines.push(`│     ${type} • #${row.rowid}`);
        lines.push(`│     ${String(preview).replace(/\n/g, ' ').slice(0, 180)}`);

        if (i !== rows.length - 1) lines.push('│');
    }

    lines.push('│');
    lines.push(`╰─ ${rows[0]?.chat || '-'}`);
    return lines.join('\n');
}

function stringify(obj) {
    return JSON.stringify(obj, (key, value) => {
        if (Buffer.isBuffer(value)) return value.toString('base64');
        if (value?.type === 'Buffer' && Array.isArray(value.data)) {
            return Buffer.from(value.data).toString('base64');
        }
        return value;
    }, 2);
}

function indentBlock(str, level = 1) {
    const pad = '  '.repeat(level);
    return str.split('\n').map((line, i) => i === 0 ? line : pad + line).join('\n');
}

function stringifySnippet(obj) {
    const raws = [];

    const json = JSON.stringify(obj, (key, value) => {
        if (key === 'unifiedResponse' && value && typeof value === 'object' && typeof value.data === 'string') {
            try {
                const decoded = Buffer.from(value.data, 'base64').toString('utf8');
                const parsed = JSON.parse(decoded);
                const id = raws.length;
                raws.push(`Buffer.from(JSON.stringify(${JSON.stringify(parsed, null, 2)})).toString('base64')`);
                return { data: `__RAW_${id}__` };
            } catch {}
        }

        if (key === 'buttonParamsJson' && typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                const id = raws.length;
                raws.push(`JSON.stringify(${JSON.stringify(parsed, null, 2)})`);
                return `__RAW_${id}__`;
            } catch {}
        }

        if (Buffer.isBuffer(value)) return value.toString('base64');
        if (value?.type === 'Buffer' && Array.isArray(value.data)) {
            return Buffer.from(value.data).toString('base64');
        }
        return value;
    }, 2);

    let code = json.replace(/^(\s*)"([^"]+)":/gm, (_, indent, key) => `${indent}${key}:`);

    code = code.split('\n').map(line => {
        const match = line.match(/^(\s*).*"__RAW_(\d+)__"/);
        if (!match) return line;

        const [, indent, id] = match;
        const block = raws[Number(id)].split('\n').map((l, i) => i === 0 ? l : indent + l).join('\n');
        return line.replace(`"__RAW_${id}__"`, block);
    }).join('\n');

    return code;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
