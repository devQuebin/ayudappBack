const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    campaignRecord: {
        type: [String], // Lista de campañas asociadas (puedes cambiarlo a un array de objetos si quieres más detalle)
        default: []
    },
    donationRecord: {
        type: [String], // Lista de donaciones (puede ser también array de objetos)
        default: []
    },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
