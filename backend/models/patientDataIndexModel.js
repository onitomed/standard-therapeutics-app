const mongoose = require('mongoose')
// schema for each page range in reports
// [startIndex, endIndex] pages are classified under report types [classifiers]
const indexSchema = mongoose.Schema({
    startIndex: Number,
    endIndex: Number
})
const docSchema = mongoose.Schema({
    index: [indexSchema],
    classifiers: [String]
})
const patientDataIndexSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add a user ID'],
        ref: 'User',
    },
    index: [docSchema]
}, {
    timestamps: true
})

module.exports = mongoose.model('PatientDataIndex', patientDataIndexSchema)