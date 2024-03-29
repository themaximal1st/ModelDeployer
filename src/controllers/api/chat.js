import debug from "debug";
const log = debug("modeldeployer:api:chat");

import Chat from "../../services/Chat.js";

function isGenerator(obj) {
    return obj && typeof obj.next === 'function';
}

export default async function chat(req, res) {
    try {
        const session = { apikey: req.session.apikey, apikey_model_id: req.session.apikey_model_id };

        const data = await Chat(req.body, session);

        if (typeof data === "string") {
            return res.json({ ok: true, data });
        } else if (!isGenerator(data)) {
            return res.json({ ok: true, data: JSON.stringify(data) });
        } else {
            for await (const message of data) {
                res.write(`data: ${JSON.stringify({ ok: true, content: message })}\n`);
            }
        }
    } catch (e) {
        console.log(e);
        log(`Error: ${e.message}`);
        return res.json({ error: e.message });
    } finally {
        res.end();
    }
}
