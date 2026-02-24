const asyncHandler = require('express-async-handler')
const axios = require('axios')
const formdata = require('form-data')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdf-lib').PDFDocument
const datastoreToken = process.env.DATASTORE_ACCESS_TOKEN
const datastoreUrl = process.env.DATASTORE_URL

const PatientData = require('../models/patientDataModel')


//  @desc    Get patient data
//  @route   GET /api/patientdata
//  @access  Private
const getPatientData = asyncHandler(async (req, res) => {
    let id
    if (req.patient && req.patient.id) {
        id = req.patient.id
        
    }   
    else
        id=req.user.id
    const patientDataCollection = await PatientData.find({patient: id})
    if (patientDataCollection.length==0) {
        const fileBase64 = Buffer.from(fs.readFileSync(path.resolve(__dirname,'../public/startpage.pdf'))).toString('base64')
        const data = {
            "branch": "main",
            "commit_message": `Created PDF for new patient ${id}`,
            "actions": [{
                "action": "create",
                "file_path": `${id}.pdf`,
                "content": fileBase64,
                "encoding": "base64",
                "author_email": "onitomed@gmail.com",
                "author_name": "Noorul Ali",
            },]
        } 
        await axios({
            method: 'post',
            url: datastoreUrl+'/repository/commits',
            data: data,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${datastoreToken}` },}, (err,response) =>  {
                if (err) {
                    res.status(500)
                    throw new Error(err.toString())
                }
        })
        const dlink = `${datastoreUrl}/repository/files/${id}%2Epdf?ref=main`
        const patientData = await PatientData.create({
            patient: req.patient,
            link: dlink,
        })
        res.status(201).json(patientData)
    }
    else {
        try {
            const response = await axios({
                method: 'get',
                url: patientDataCollection[0].link,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${datastoreToken}` },})
            if (response.status == 401) {
                res.status(401)
                throw new Error("Unable to access medical data")
            }
            else {
                res.contentType("application/pdf")
                res.setHeader( "Content-Disposition", "inline")
                res.status(200).send(response.data.content)
            }
            
        
        } catch (err) {
            res.status(500)
            throw new Error(err.toString())
        }
    }
})


//  @desc    Add patient data
//  @route   POST /api/patientdata
//  @access  Private
const addPatientData = asyncHandler(async (req, res) => {
    let fileUploaded = false
    if (!req.files || Object.keys(req.files).length === 0) {
        fileUploaded = false 
    }
    else {
        fileUploaded = true
        file = req.files.dataFile
        if (!fs.readdirSync(path.resolve(__dirname,'..')).includes('temp'))
            fs.mkdirSync(path.resolve(__dirname,'../temp'))
        uploadPath = path.resolve(__dirname,`../temp/${req.patient.id}_new.pdf`)
        file.mv(uploadPath, (err) => {
            if (err) {
                res.status(500)
                throw new Error('error in file upload')
            }
        })
    }
    const patientDataCollection = await PatientData.find({patient: req.patient.id})
    if (patientDataCollection.length == 0) {
        let fileBase64
        if (fileUploaded) {
            const pdf1 = path.resolve(__dirname,'../public/startpage.pdf') 
            const pdf2 = path.resolve(__dirname,`../temp/${req.patient.id}_new.pdf`)
            const pdfsToMerge = [pdf2, pdf1]
            const mergedPdf = await PDFDocument.create() 
            for (const pdfPath of pdfsToMerge) { 
                const uint8Array = fs.readFileSync(pdfPath)
                const pdf = await PDFDocument.load(uint8Array); 
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page)
                })
            }
            fileBase64 = await mergedPdf.saveAsBase64()
        }
        else {
            fileBase64 = Buffer.from(fs.readFileSync(path.resolve(__dirname,'../public/startpage.pdf'))).toString('base64')
        }
        const data = {
            "branch": "main",
            "commit_message": `Added PDF for patient ${req.patient.id}`,
            "actions": [{
                "action": "create",
                "file_path": `${req.patient.id}.pdf`,
                "content": fileBase64,
                "encoding": "base64",
                "author_email": "onitomed@gmail.com",
                "author_name": "Noorul Ali",
            },]
        } 
        await axios({
            method: 'post',
            url: datastoreUrl+'/repository/commits',
            data: data,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${datastoreToken}` },}, (err,response) =>  {
                if (err) {
                    res.status(500)
                    throw new Error(err.toString())
                }
        })
        const dlink = `${datastoreUrl}/repository/files/${req.patient.id}%2Epdf?ref=main`
        const patientData = await PatientData.create({
            patient: req.patient,
            link: dlink,
        })
        res.status(200).json(patientData)
        const directory = path.resolve(__dirname,'../temp')
        for (const file of fs.readdirSync(directory)) {
            if (file.includes(req.patient.id))
                fs.unlinkSync(path.resolve(directory,file))
        }
        
    }
    else {
        try {
            const response = await axios({
                method: 'get',
                url: patientDataCollection[0].link,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${datastoreToken}` },})
            if (!fs.readdirSync(path.resolve(__dirname,'..')).includes('temp')) {
                fs.mkdirSync(path.resolve(__dirname,'../temp'))
            }
            fs.writeFileSync(path.resolve(__dirname,`../temp/${req.patient.id}_old.pdf`),response.data.content,'base64')
            if (fileUploaded) {
                const pdf1 = path.resolve(__dirname,`../temp/${req.patient.id}_old.pdf`) 
                const pdf2 = path.resolve(__dirname,`../temp/${req.patient.id}_new.pdf`)
                const pdfsToMerge = [pdf2, pdf1]
                const mergedPdf = await PDFDocument.create() 
                for (const pdfPath of pdfsToMerge) { 
                    const uint8Array = fs.readFileSync(pdfPath)
                    const pdf = await PDFDocument.load(uint8Array);  
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => {
                        mergedPdf.addPage(page)
                    })
                }
                fileBase64 = await mergedPdf.saveAsBase64()
                const data = {
                    "branch": "main",
                    "commit_message": `Updated PDF for patient ${req.patient.id}`,
                    "actions": [{
                        "action": "update",
                        "file_path": `${req.patient.id}.pdf`,
                        "content": fileBase64,
                        "encoding": "base64",
                        "author_email": "onitomed@gmail.com",
                        "author_name": "Noorul Ali",
                    },]
                } 
                await axios({
                    method: 'post',
                    url: datastoreUrl+'/repository/commits',
                    data: data,
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${datastoreToken}` },}, (err,response) =>  {
                        if (err) {
                            res.status(500)
                            throw new Error(err.toString())
                        }
                })
            }
            
        } catch (err) {
            res.status(500)
            throw new Error(err.toString())
        }
        
        const patientData = await PatientData.findOneAndUpdate({patient: req.patient.id}, {updatedAt: Date.now}, {new: true})
        res.status(200).json(patientData)
        const directory = path.resolve(__dirname,'../temp')
        for (const file of fs.readdirSync(directory)) {
            if (file.includes(req.patient.id))
                fs.unlinkSync(path.resolve(directory,file))
          }
        
        
    }
        
})

//  @desc    Update patient data
//  @route   PUT /api/patientdata/:id
//  @access  Private
const updatePatientData = asyncHandler(async (req, res) => {
    const patientData = await PatientData.findById(req.params.id)

    if(!patientData) {
        res.status(400)
        throw new Error('Patient data object not found')
    }

    const updatedPatientData = await PatientData.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    })

    res.status(200).json(updatedPatientData)
})

//  @desc    Delete patient data
//  @route   DELETE /api/patientdata
//  @access  Private
const deletePatientData = asyncHandler(async (req, res) => {
    const patientDataCollection = await PatientData.find({patient: req.patient.id})
    if (!patientDataCollection.length == 0) {
        const data = {
            "branch": "main",
            "commit_message": `Deleted PDF for patient ${req.patient.id}`,
            "actions": [{
                "action": "delete",
                "file_path": `${req.patient.id}.pdf`,
                "author_email": "onitomed@gmail.com",
                "author_name": "Noorul Ali",
            },]
        } 
        await axios({
            method: 'post',
            url: datastoreUrl+'/repository/commits',
            data: data,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${datastoreToken}` },}, (err,response) =>  {
                if (err) {
                    res.status(500)
                    throw new Error(err.toString())
                }
        })
        const patientData = await PatientData.findOneAndDelete({patient: req.patient.id})
        res.status(200).json(patientData)
    }
    

    else {
        res.status(400)
        throw new Error('patient data not found')
    }

    
})

module.exports = {
    getPatientData,
    addPatientData,
    updatePatientData,
    deletePatientData
}