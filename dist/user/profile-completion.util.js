"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissingProfileFields = getMissingProfileFields;
const role_1 = require("./role");
function getMissingProfileFields(role, fullName, mobileNumber, whatsappNumber) {
    const missingFields = [];
    if (!fullName?.trim()) {
        missingFields.push('full_name');
    }
    if ((role === role_1.Role.AGENT || role === role_1.Role.AGENCY) && !mobileNumber?.trim()) {
        missingFields.push('mobile_number');
    }
    if ((role === role_1.Role.AGENT || role === role_1.Role.AGENCY) &&
        !whatsappNumber?.trim()) {
        missingFields.push('whatsapp_number');
    }
    return missingFields;
}
//# sourceMappingURL=profile-completion.util.js.map