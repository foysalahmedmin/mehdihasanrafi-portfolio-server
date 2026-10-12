"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation = (schema) => {
    return async (req, _res, next) => {
        try {
            const parsed = await schema.parseAsync({
                params: req.params,
                query: req.query,
                body: req.body,
                cookies: req.cookies,
                session: req.session,
            });
            req.body = parsed.body;
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.default = validation;
