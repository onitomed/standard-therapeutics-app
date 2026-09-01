const asyncHandler = require('express-async-handler')
const axios = require('axios')
const formdata = require('form-data')
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const util = require('util')
const execFileAsync = util.promisify(execFile)
const datastoreToken = process.env.DATASTORE_ACCESS_TOKEN
const datastoreUrl = process.env.DATASTORE_URL

const PatientData = require('../models/patientDataModel')

// GitLab's "get file" endpoint returns the file wrapped in base64 inside a
// JSON body -- fine for small files, but that JSON string alone runs ~1.33x
// the PDF's size, held in memory on top of everything a merge needs. The
// "raw" endpoint returns the actual bytes, so it can be streamed straight
// to disk instead.
function toRawFileUrl(link) {
    const [base, query] = link.split('?')
    return query ? `${base}/raw?${query}` : `${base}/raw`
}

async function downloadToFile(url, destPath, token) {
    const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
        headers: { "Authorization": `Bearer ${token}` },
    })
    await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(destPath)
        response.data.pipe(writer)
        writer.on('finish', resolve)
        writer.on('error', reject)
        response.data.on('error', reject)
    })
}

// Merges PDFs (in the given order) by shelling out to qpdf rather than
// parsing them into an in-memory document model the way pdf-lib does.
// qpdf works off the files on disk and keeps its own memory use small and
// roughly constant regardless of how large the inputs are -- pdf-lib
// commonly needs several times a large PDF's size in heap to load, copy,
// and re-serialize it, which is what was crashing a 512MB server on a
// patient's accumulated medical record. Requires the qpdf binary to be
// present on the host (e.g. `apt-get install qpdf`).
async function mergePdfsWithQpdf(pdfPathsInOrder, outputPath) {
    await execFileAsync('qpdf', ['--empty', '--pages', ...pdfPathsInOrder, '--', outputPath])
}


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
        const updatedAt = patientDataCollection[0].updatedAt
        // ETag has to come from the datastore's own view of the file, not
        // just our own bookkeeping — Mongo's updatedAt only moves when
        // addPatientData runs, so an edit made directly in the datastore
        // (bypassing this app entirely) would otherwise leave the ETag
        // unchanged and a stale cached copy would keep being served
        // forever. A HEAD request against the same file URL asks the
        // datastore (GitLab's Repository Files API) for its content hash
        // without transferring the file body, so this stays cheap.
        let etag = null
        try {
            const headResponse = await axios({
                method: 'head',
                url: patientDataCollection[0].link,
                headers: { "Authorization": `Bearer ${datastoreToken}` },
            })
            const contentSha256 = headResponse.headers['x-gitlab-content-sha256']
            if (contentSha256) {
                etag = `"${contentSha256}"`
            }
        } catch (err) {
            // Datastore didn't answer HEAD with the header we need (wrong
            // API, network hiccup, ...) — fall back to our own bookkeeping
            // rather than breaking the page. This just means an
            // out-of-band datastore edit won't be picked up until
            // addPatientData next touches this record.
        }
        if (!etag) {
            etag = `"pd-${patientDataCollection[0].id}-${updatedAt.getTime()}"`
        }

        res.setHeader('ETag', etag)
        res.setHeader('Last-Modified', updatedAt.toUTCString())
        // private: this is one patient's own record, never a shared cache.
        // must-revalidate: always let the server confirm freshness (a 304
        // round-trip) rather than assume an unexpired copy is still good —
        // acceptable for medical records where correctness matters more
        // than shaving off the revalidation request.
        res.setHeader('Cache-Control', 'private, must-revalidate')

        if (req.headers['if-none-match'] === etag) {
            res.status(304).end()
            return
        }

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
            const mergedPath = path.resolve(__dirname,`../temp/${req.patient.id}_merged.pdf`)
            await mergePdfsWithQpdf([pdf2, pdf1], mergedPath)
            fileBase64 = fs.readFileSync(mergedPath).toString('base64')
            fs.unlinkSync(mergedPath)
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
            if (!fs.readdirSync(path.resolve(__dirname,'..')).includes('temp')) {
                fs.mkdirSync(path.resolve(__dirname,'../temp'))
            }
            const oldPath = path.resolve(__dirname,`../temp/${req.patient.id}_old.pdf`)
            // Streamed straight to disk -- see downloadToFile's comment for
            // why this matters for memory, especially here where the
            // "old" file is the patient's whole accumulated record and
            // only grows over time.
            await downloadToFile(toRawFileUrl(patientDataCollection[0].link), oldPath, datastoreToken)
            if (fileUploaded) {
                const newPath = path.resolve(__dirname,`../temp/${req.patient.id}_new.pdf`)
                const mergedPath = path.resolve(__dirname,`../temp/${req.patient.id}_merged.pdf`)
                await mergePdfsWithQpdf([newPath, oldPath], mergedPath)
                const fileBase64 = fs.readFileSync(mergedPath).toString('base64')
                fs.unlinkSync(mergedPath)
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