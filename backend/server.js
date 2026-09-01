const express = require('express')
const path = require('path')
const swaggerUi = require('swagger-ui-express')

const dotenv = require('dotenv').config({ path: path.join(__dirname, 'config', 'config.env') })
const {errorHandler} = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const swaggerDocument = require('./docs/apidocs.json');
const cors = require('cors')
const fileupload = require('express-fileupload')

const port = process.env.PORT || 5000

connectDB()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(cors({ exposedHeaders: ['ETag', 'Last-Modified'] }))
app.use(fileupload())


app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/patientdata', require('./routes/patientDataRoutes'))
app.use('/api/patient', require('./routes/patientRoutes'))
app.use('/view', require('./routes/viewPatientDataRoutes'))
app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(swaggerDocument));


app.use(errorHandler)

app.listen(port, () => console.log(`Server started on port ${port}`))
