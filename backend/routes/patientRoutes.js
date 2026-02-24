const express = require('express')
const router = express.Router()
const { getPatient, addPatient, updatePatient, deletePatient, getPatientsForUser, addPatientAccess, getSelf } = require('../controllers/patientController')
const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getSelf).post(protect, addPatient).delete(protect, deletePatient).put(protect, updatePatient)
router.route('/user').get(protect, getPatientsForUser).post(protect, addPatientAccess)
router.route('/:id').get(protect, getPatient)

module.exports = router