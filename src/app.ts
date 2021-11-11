import express from "express";
import dotenv from 'dotenv'
dotenv.config()


import   './watcher'


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port=process.env.PORT || 3004

//intialize the server
app.listen(port, () => console.log("Server up and running at port:",port))


