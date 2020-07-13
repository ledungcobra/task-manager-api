const express = require('express')
const app = express()
require('./src/db/mongoose')
const multer = require('multer')
const upload = multer({
    dest:'images'
})
app.post('/upload',upload.single('upload') ,(req, res) =>{
    res.send()
})
const userRouter = require('./src/router/user')
const taskRouter = require('./src/router/task')
const port = process.env.PORT
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('App is listening on port ' + port)
})