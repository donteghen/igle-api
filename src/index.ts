import express from "express";
import path from "path";
import dotenv from 'dotenv'
import cors from 'cors'



// Router import
import { connectDb } from "./config/dbconfig";


//  initial app variables and instances
const app = express();
dotenv.config()
connectDb()
const port = process.env.PORT || 8080;


// define the express app middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

// app.use(express.static(path.join(__dirname, '../client', 'build')))


app.get('/api/', (req, res) => {
    res.send('welcome the autobazar api')
})
app.get("*", (req, res) => {
    res.redirect('/api/')
    // res.sendFile(path.join(__dirname, '../client', 'build', 'index.html'));
    // res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );