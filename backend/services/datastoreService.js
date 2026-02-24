const axios = require('axios')
const datastoreToken = process.env.DATASTORE_ACCESS_TOKEN
const datastoreUrl = process.env.DATASTORE_URL

const getPdfFromDatastore = async (id) => {
    const response = await axios({
        method: 'get',
        url: `${datastoreUrl}/repository/files/${id}%2Epdf?ref=main`,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${datastoreToken}` },})
    return response.data.content
}

module.exports = {
    getPdfFromDatastore
}