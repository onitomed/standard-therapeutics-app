const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Patient = require('../models/patientModel')
const User = require('../models/userModel')
const e = require('express')

//  @desc    Get patient
//  @route   GET /api/patient/:id
//  @access  Private
const getPatient = asyncHandler(async (req, res) => {
    const id = req.params.id
    if (!id) {
        res.status(400)
        throw new Error('No patient ID')
    }
    else {
        

    const patient = await Patient.findById(id)
    if (patient) {
        res.status(200).json({
            _id: patient._id,
            name: patient.name,
            dependent: patient.dependent,
            root: patient.root,
            token: generateToken(req.user.id,patient._id),
            users: patient.users
        })
    }
    else {
        res.status(400).json('Patient not found')
    }
}
})

//  @desc    Add patient
//  @route   POST /api/patient
//  @access  Private
const addPatient = asyncHandler(async (req, res) => {
    const { name, dependent } = req.body
    const userId = req.user.id
    if(dependent==null || !name || !userId) {
        res.status(400)
        throw new Error("Please add all fields")
    }
    let patient = null
    if (dependent) {
        patient = await Patient.create({
            name,
            dependent,
            root: false,
            users: [req.user.id, process.env.ROOT_USER_ID]
        })
    }
    else {
        patient = await Patient.create({
            name,
            dependent,
            root: true,
            users: [req.user.id, process.env.ROOT_USER_ID]
        })
    }
    if (patient) {
        res.status(201).json({
            _id: patient._id,
            name: patient.name,
            root: patient.root,
            token: generateToken(req.user.id,patient._id),
            users: patient.users,
            dependent: patient.dependent
        })
    }
    else {
        res.status(400)
        throw new Error('Invalid patient data')
    }

})

//  @desc    Update patient
//  @route   PUT /api/patient
//  @access  Private
const updatePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.patient.id)

    if(!patient) {
        res.status(400)
        throw new Error('Patient not found')
    }

    const updatedPatient = await Patient.findByIdAndUpdate(req.patient.id, req.body, {
        new: true,
    })
    res.status(200).json(updatedPatient)
})

//  @desc    Delete patient
//  @route   DELETE /api/patient
//  @access  Private
const deletePatient = asyncHandler(async (req, res) => {
    const p = await Patient.findById(req.patient.id)
    if (p) {
        const patient = await Patient.findByIdAndDelete(req.patient.id)
        res.status(200).json(patient)
    }
    else {
        res.status(400)
        throw new Error('Patient object not found')
    }

})

//  @desc    Get all patients for user ID
//  @route   GET /api/patient/user
//  @access  Private
const getPatientsForUser = asyncHandler(async (req, res) => {
    if (!req.user.id) {
        res.status(400)
        throw new Error("No token")
    }
    const patients = await Patient.find({users: req.user.id})
    let p = []
    if (patients) {
        
        patients.forEach(patient => {
            t = {'name': patient.name, 'id':patient.id, 'dependent':patient.dependent, 'root':patient.root}
            p.push(t)       
        });
        res.status(200).json(p)
    }
    else {
        res.status(400).json('No patients found')
    }
})

//  @desc    Give patient access to user
//  @route   POST /api/patient/user
//  @access  Private
const addPatientAccess = asyncHandler(async (req, res) => {
    
    const token = Buffer.from(req.body.patientToken, 'base64url').toString()
    if (!token) {
        res.status(400)
        throw new Error('No token')
    }
    const patientId=jwt.verify(token, process.env.JWT_SECRET).id
    const patient = await Patient.findById(patientId)
    if(!patient) {
        res.status(400)
        throw new Error('Patient not found')
    }
    if (patient.users.includes(req.user.id)) {
        res.status(400)
        throw new Error('Already has access')
    }
    else {
        patient.users.push(req.user.id)
        const updatedPatient = await Patient.findByIdAndUpdate(patientId, patient, {
            new: true,
        })
        
        res.status(201).json({
            _id: updatedPatient._id,
            name: updatedPatient.name,
            root: updatedPatient.root,
            token: generateToken(req.user.id,updatedPatient._id),
            users: updatedPatient.users,
            dependent: updatedPatient.dependent
        })
    }
})

//  @desc    Get self patient profile
//  @route   GET /api/patient
//  @access  Private
const getSelf = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.patient.id)
    if (patient) {
        res.status(200).json(patient)
    }
    else {
        res.status(400).json('Patient not found')
    }
})



const generateToken = (id,pid) => {
    return jwt.sign({ id,pid }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    })
}



module.exports = {
    getPatient,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientsForUser,
    addPatientAccess,
    getSelf
}