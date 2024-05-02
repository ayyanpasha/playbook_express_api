"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ContainerSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is the name of the User model
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Container = (0, mongoose_1.model)('Code', ContainerSchema);
Container.createIndexes();
exports.default = Container;
