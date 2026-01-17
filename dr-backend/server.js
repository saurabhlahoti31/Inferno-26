require("dotenv").config();
const express = require("express");

const app = express()
const port = process.env.PORT;

app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Backend working in express")
})

app.listen(port,()=>{
    console.log(`Server working on: http://localhost:3000`);
})