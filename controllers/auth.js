const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt =  require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// =============== FUNCTION FOR LOGIN =================
exports.login = async(req, res)=>{
    try{
        const { email, password} = req.body;

        //If submit without email or pass
        if (!email || !password){
            return res.status(400).render('login',{
                message: 'Please enter an email and password'
            });
        }


    
        db.query('SELECT * FROM users WHERE email =?', [email], async (error, results) =>{
            console.log(results);
            //If NO result or WRONG pass
            if(!results || !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('login',{
                    message: 'Wrong Email or Password' }
                    )
                }
            
            else{
                const id = results[0].id;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    //When this token expired
                    expiresIn: process.env.JWT_EXPIRES_IN
                });


                //create token
                console.log("The token is: "+ token);


                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 //convert to milliseconds
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/");
            }
            })


    }catch (error){
        console.log(error);
    }



}





// ========== FUNCTION FOR REGISTER ===================
exports.register = (req, res)=>{
    console.log(req.body); //grab all data was sent from the form and log it in terminal
    

    /* 2 ways to called this structuring in JS - they are exactly the same
            == Way 1 ==
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm; */


    //      == Way 2 ==
    const {name, email, password, passwordConfirm} = req.body;



    db.query( 'SELECT email FROM users WHERE email = ?', [email], async (error, results)=>{
        if (error){
            console.log(error);
        }

        /* in case there is that email on database, it will skip all
           rest of the code and stop it
        */
        if (results.length >0){
            return res.render('register', {
                message: 'That email is already in use'
            })
        } else if ( password != passwordConfirm){
            return res.render ('register',{
                message: 'Password do not match'
            });
        }


        //Password security
        /* bcrypt.hash(password, rounds)
            -round: how many time do you want to hash your password ---- 8 should be good
        */
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', {name: name, email:email, password: hashedPassword}, (error, results)=>{
            if(error){
                console.log(error);
            }else{
                console.log(results);
                return res.render('register',{
                    message: 'User Registered Successfully !'
                });
            }
        })

    });

}