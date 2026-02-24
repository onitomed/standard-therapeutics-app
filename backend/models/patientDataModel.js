const mongoose = require('mongoose')

const patientDataSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add a patient ID'],
        ref: 'Patient',
    },
    link: {
        type: String,
        required: [true, 'Please add data']
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('PatientData', patientDataSchema)