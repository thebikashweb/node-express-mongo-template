
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

import './helper/watcher'

// import app 
const app = express()



// use json body
app.use(express.json())

const port=process.env.PORT || 3004

//intialize the server
app.listen(port, () => console.log("Server up and running at port:",port))





