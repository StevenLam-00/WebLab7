const express = require("express");
const path = require("path");
const mysql = require ("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config({path: './.env'});

const app = express ();



const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});




//__dirname: var that give you access to the current directory where you are at the moment in terminal
const publicDirectory = path.join(__dirname, './public');
console.log(__dirname);
app.use(express.static(publicDirectory)) //grab all static files like JS, CSS




//Parse URL-encoded bodies (as sent by HTML forms) - and show in terminal
app.use(express.urlencoded({
    extended: false
}));




//Parse JSON bodies (as sent by API clients)
// This is for make sure data from form come in as json
app.use(express.json());
app.use(cookieParser());



//hbs: handle-bars
app.set('view engine', 'hbs');




db.connect((error) =>{
    if (error){
        console.log(error)
    }
    else{
        console.log("MySQL Connected...")
    }
})

/* No more needed when has directory to ./routes/pages
app.get("/", (req, res)=>{
    //res.send("<h1> Home Page</h1>")
    res.render("index") //render file index.hbs
});

app.get("/register", (req, res)=>{
    //res.send("<h1> Home Page</h1>")
    res.render("register") //render file register.hbs
});
*/




//Define router
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));





app.listen(5000, () => {
    console.log("Server started on port 5000");
})