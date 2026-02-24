const express = require('express')
const router = express.Router()
const { getPatientData, addPatientData, updatePatientData, deletePatientData } = require('../controllers/patientDataController')
const { getShareLink } = require('../controllers/sharedPatientDataController') 

const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getPatientData).post(protect, addPatientData).delete(protect, deletePatientData)
router.route('/share').get(protect, getShareLink)

module.exports = router