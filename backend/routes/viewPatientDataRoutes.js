const express = require('express')
const router = express.Router()
const { getSharedPatientData } = require('../controllers/sharedPatientDataController') 

router.route('/:id').get(getSharedPatientData)

module.exports = router