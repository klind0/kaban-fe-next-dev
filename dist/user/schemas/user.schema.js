"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const role_1 = require("../role");
const class_transformer_1 = require("class-transformer");
let User = class User {
    email;
    full_name;
    password;
    role;
    resetPasswordToken;
    resetPasswordExpires;
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "full_name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        select: false,
    }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: Number,
        enum: role_1.Role,
        default: role_1.Role.GUEST,
    }),
    __metadata("design:type", Number)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, select: false }),
    __metadata("design:type", String)
], User.prototype, "resetPasswordToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], User.prototype, "resetPasswordExpires", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            getters: true,
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toHexString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
        toObject: { virtuals: true, getters: true },
    })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
exports.UserSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
//# sourceMappingURL=user.schema.js.map