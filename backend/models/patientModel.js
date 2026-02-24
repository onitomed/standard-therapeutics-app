const mongoose = require('mongoose')

const patientSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    dependent: {
        type: Boolean,
        required: [true, 'Please provide dependency (is patient an independent user or dependent on another user?)']
    },
    root: {
        type: Boolean,
        required: [true, 'Please add root Boolean variable (is this patient profile of the creating user']
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // users[0] is root user for patient. For dependent, users[0] created patient profile. For independent, users[0] is userId 
}, {
    timestamps: true,
})

module.exports = mongoose.model('Patient', patientSchema)