"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContact = void 0;
const config_1 = __importDefault(require("../../config"));
const sendEmail_1 = require("../../utils/sendEmail");
const contact_model_1 = require("./contact.model");
const createContact = async (payload) => {
    // Save to database
    const created_contact = await contact_model_1.Contact.create(payload);
    // Send email notification
    try {
        await (0, sendEmail_1.sendEmail)({
            to: config_1.default.auth_user_email,
            subject: `Contact Form: ${payload.subject}`,
            text: `You have received a new contact message from ${payload.name} (${payload.email}):\n\n${payload.message}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${payload.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
            <p><strong>Subject:</strong> ${payload.subject}</p>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${payload.message}</p>
          </div>
        </div>
      `,
        });
    }
    catch (error) {
        // Log error but don't fail the request if email fails
        console.error('Failed to send contact email:', error);
    }
    return created_contact.toObject();
};
exports.createContact = createContact;
