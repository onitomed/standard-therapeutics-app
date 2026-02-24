const asyncHandler = require('express-async-handler')
const formdata = require('form-data')
const datastoreToken = process.env.DATASTORE_ACCESS_TOKEN
const datastoreUrl = process.env.DATASTORE_URL

const PatientDataIndex = require('../models/patientDataIndexModel')

//  @desc    Get patient data index
//  @route   GET /api/patientdataindex
//  @access  Private
const getPatientDataIndex = asyncHandler(async (req, res) => {

})


//  @desc    Add patient data index
//  @route   POST /api/patientdataindex
//  @access  Private
const addPatientDataIndex = asyncHandler(async (req, res) => {
        
})

//  @desc    Update patient data index
//  @route   PUT /api/patientdataindex
//  @access  Private
const updatePatientDataIndex = asyncHandler(async (req, res) => {

})

//  @desc    Delete patient data index
//  @route   DELETE /api/patientdataindex
//  @access  Private
const deletePatientDataIndex = asyncHandler(async (req, res) => {
 
})

module.exports = {
    getPatientDataIndex,
    addPatientDataIndex,
    updatePatientDataIndex,
    deletePatientDataIndex
}