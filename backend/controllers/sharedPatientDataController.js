const asyncHandler = require('express-async-handler')
const { getPdfFromDatastore } = require('../services/datastoreService')
const jwt = require('jsonwebtoken')

const getShareLink = asyncHandler(async (req, res) => {
    let token = ''
    if (req.data) {
        if (data.duration) {
            if (req.patient && req.patient.id)
                token = generateToken(req.patient.id, duration)
            else
                generateToken(req.user.id, duration)
        }
    }
    else {
        if (req.patient && req.patient.id)
            token = generateToken(req.patient.id)
        else
            generateToken(req.user.id)
    }
    const urlToken = Buffer.from(token).toString('base64url')
    res.status(200).json({link: `${urlToken}`})
})
const getSharedPatientData = asyncHandler(async (req, res) => {
    const token = Buffer.from(req.params.id, 'base64url').toString()
    try {
        patientId=jwt.verify(token, process.env.JWT_SECRET).id
        const base64Pdf = await getPdfFromDatastore(patientId)
        res.contentType("application/pdf")
        res.setHeader( "Content-Disposition", "inline")
        res.status(200).send({base64Pdf: base64Pdf})
        
    } catch (error) {
        if (error.name == 'TokenExpiredError') {
            res.status(401)
            throw new Error('TokenExpiredError')
        }
        else    {
            res.status(500)
            throw new Error(err.toString())
        }
    }
})

const generateToken = (id, duration='30d') => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: duration,
    })
}

module.exports = {
    getShareLink,
    getSharedPatientData
}