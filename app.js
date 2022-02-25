require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const nodemailer = require("nodemailer");
const Razorpay = require('razorpay')


const { nanoid } = require("nanoid");

const app = express();

app.use(express.static("public"));


app.use(express.static("public"));
app.set("view engine" , "ejs");
app.use(express.urlencoded({
    extended: true,
}));

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

////////flash message middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next()
})


mongoose.connect("mongodb+srv://vishnu-kumar:Abcd1234@cluster0.ukavm.mongodb.net/student?retryWrites=true&w=majority" , {useUnifiedTopology: true , useNewUrlParser: true});

const userSchema = new mongoose.Schema({ 
    fname: String,
    lname: String,
    email : String,
    usn: String,
    branch: String,
    semester: String,
    password: String,
    verified: {
        type: Boolean,
        default: false,
    },
    event: [{type : String , require: true}],
    sdate: [{type : String , require: true}],
    edate: [{type : String , require: true}],
    organizer: [{type : String , require: true}]
    // events : [{String}]
    

});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User" , userSchema);

//////////////

const paymentDetailsSchema = new mongoose.Schema({
	orderId: {
		type: String,
		required: true
	},
	receiptId: {
		type: String
	},
	paymentId: {
		type: String,
	},
	signature: {
		type: String,
	},
	amount: {
		type: Number
	},
	currency: {
		type: String
	},
	createdAt: {
		type: Date
	},
	status: {
		type: String
	}
});

const PaymentDetail = new mongoose.model('PaymentDetail', paymentDetailsSchema)



// Create an instance of Razorpay
let razorPayInstance = new Razorpay({
	key_id: "rzp_test_bSZ5GgLzw6hDXa",
	key_secret: "3R0kL0bBdQocpX5js7MRLHWp"
})




   

///////otp
    var otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);
    console.log(typeof(otp));
    console.log(otp);
    
passport.use(User.createStrategy());

passport.serializeUser(function(user , done){
    done(null , user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err , user);
    });
});



app.get("/" , function(req , res){
    res.render("home")
});



app.get("/campus" , function(req, res){
    res.render("logincampus")
});

/////////sending automatic email

var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "bmsce2024@gmail.com",
        pass: "Abcd@1234",
    }
});


var sendConfirmationEmail = (fname, email , otp) => {
    console.log("Check");
    transport.sendMail({
        from: "bmsce2024@gmail.com",
        to: email,
        subject: "Verification code for signup.",
        html: `<div>
            
          <h2>Hello ${fname}</h2>
          <p>you have signed up on our website to access your account veify the otp.
          <h2>OTP is: </h2> <h1>${otp} </h1>  </p>
         
          </div>`,
    }).catch(err => console.log(err));
};


app.post('/verifyotp', function (req, res) {

    
    const submittedotp = parseInt(req.body.otp);
    // console.log(req.user);
    // console.log(typeof(submittedotp));
    if(submittedotp== otp)
    {
        User.findByIdAndUpdate(req.user.id ,{verified: true}, function(err , foundUser){
        if(err){
            console.log(err);
        } else{
            if(foundUser){
                // return res.status(200).json({error: "account is successfully created"});
                res.redirect("/otpsuccess")
                
            }
        }
    });
    // console.log(foundUser.verified);
        // User.findOneAndUpdate({id: id, verified: true});
        // console.log(User.ID);
    }
    else{
        req.session.message = {
            type: "danger",
            intro: "Incorrect OTP!",

            message: "Please enter the correct otp!"
        }
        ID = req.user.id;
        res.redirect(`/otp/${ID}`);
    }
    // console.log(err);



   
});

app.get("/otpsuccess" , function(req, res){
    res.render("otpsuccess");
});

app.get("/otp/:id" , function(req, res){
    const id = req.params.id;
    // console.log(id);
    // console.log(id);
    // console.log(id);
    // User.findById(id ,function(err , foundUser){
        
        // if(foundUser){
            // res.render("mainpage" , {admin : foundUser});
            // console.log(foundUser.map());
            // console.log(foundUser.event)
            // console.log(admin);
            // console.log(foundUser)
        // }
    // });
    
    


    res.render("otp");
});







app.get("/studentsignup" , function(req , res){
    res.render("studentsignup")
});

app.post("/studentsignup" , function(req , res){
    const {username , password} = req.body;
    var decimal=  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    // let everify = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.+-]+\.ac+\.in$/;
    let everify = /^[a-zA-Z0-9._%+-]+@bmsce.ac.in$/;
    User.findOne({username}).exec((err, user) => {
        if(user){
            // return res.status(400).json({error: "User this email already exists."});
            req.session.message = {
                type: "danger",
                intro: "Email is already in use",
    
                message: "use different email to signup "
            }
            // ID = req.user.id;
            res.redirect("/studentsignup");


        }
        else if(!username.match(everify)){
            req.session.message = {
                type: "danger",
                intro: "",
    
                message: "only bmsce email is ending with @bmsce.ac.in is valid"
            }
            // ID = req.user.id;
            res.redirect("/studentsignup");

        }


        else if(!password.match(decimal))
        {
            req.session.message = {
                type: "danger",
                intro: "",
    
                message: "Password should be 8 to 15 character & contain number , Uppercase letter , lowercase letter and  special character"
            }
            // ID = req.user.id;
            res.redirect("/studentsignup");

        }
        else{
            User.register({fname: req.body.fname, lname: req.body.lname , username: req.body.username , usn : req.body.usn , branch: req.body.branch ,semester: req.body.semester  }, req.body.password , function(err , user){



                if(err){
                    console.log(err);
                    res.redirect("/studentsignup");
        
                } else{
                    passport.authenticate("local")(req , res, function(){
                        
                        sendConfirmationEmail(
                            req.body.fname,
                            req.body.username,
                            otp,
        
                        );
        
                        ID = req.user.id;
                        res.redirect(`/otp/${ID}`);
                        
                    });
                }
            })

        }
    })
    
});





app.get("/studentlogin" , function(req, res){
    res.render("studentlogin")
});

app.post("/studentlogin" , function(req, res){

    const {username} = req.body;
    User.findOne({username}).exec((err, user) => {
        // console.log(user.verified);
        if(!user){
            // return res.status(400).json({error: "No user is found."});
            req.session.message = {
                type: "danger",
                intro: "Invalid User!",
    
                message: "No user is found with this email."
            }
            // ID = req.user.id;
            res.redirect("/studentlogin");

        }
        else if(user.verified==false)
        {
            // return res.status(400).json({error: "to login your account verify your acc first"});
            // ID = user.id;
            // res.redirect(`/otp/${ID}`);
            const user = new User({
                username: req.body.username,
                password: req.body.password
            });

            passport.authenticate("local")(req , res, function(){
        
                // sendConfirmationEmail(
                //     req.body.fname,
                //     req.body.username,
                //     otp,

                // );

                ID = req.user.id;
                  res.redirect(`/otp/${ID}`);
                
            });

            // req.login(user, function(err){
            //     if(err){
            //         console.log(err);
            //     }else{
            //         ID = user.id;
            //         res.redirect(`/otp/${ID}`);

                    // passport.authenticate("local")(req, res , function(){
                        // res.redirect("/mainpage");

                    // });
            //     }
            // });
        }
        else{
            
            const user = new User({
                username: req.body.username,
                password: req.body.password
            });
            req.login(user, function(err){
                if(err){
                    console.log(err);
                }else{
                    passport.authenticate("local")(req, res , function(){
                        res.redirect("/mainpage");
                    });
                }
            });

        }

    });
    


    
});

app.get("/mainpage" , function(req, res){
    // if(req.isAuthenticated()){
    //     res.render("mainpage");  
    //   }else{
    //       res.redirect("/studentlogin");
    //   }
    if(req.isAuthenticated()){

        User.findById(req.user.id ,function(err , foundUser){
        
        if(foundUser){
            res.render("mainpage" , {admin : foundUser});
            // console.log(foundUser.map());
            // console.log(foundUser.event)
            // console.log(admin);
            // console.log(foundUser)
        }
    })
        // res.render("event")  ;
    }else{
        res.redirect("/studentlogin");
      }
});



app.get("/profile" , function(req, res){
    if(req.isAuthenticated()){
        User.findById(req.user.id ,function(err , foundUser){
        
            if(foundUser){
                res.render("profile" , {admin : foundUser});
                // console.log(foundUser.map());
                // console.log(foundUser.event)
                // console.log(admin);
                // console.log(foundUser)
            }
        })
    //   res.render("profile");  
    }else{
        res.redirect("/studentlogin");
    }
    
});


/////FEE PAYMENT
app.get("/payment" , function(req, res){
    res.render("feepayment");
})

app.get("/order" , function(req, res){
    res.render("order")
})


app.post('/order', function(req, res, next) {
	params = {
		amount: req.body.amount *100 ,
		currency: "INR",
		receipt: nanoid(),
		payment_capture: "1"
	}
	razorPayInstance.orders.create(params)
	.then(async (response) => {
		// Save orderId and other payment details
		const paymentDetail = new PaymentDetail({
			orderId: response.id,
			receiptId: response.receipt,
			amount: response.amount,
			currency: response.currency,
			createdAt: response.created_at,
			status: response.status
		})
		try {
			// Render Order Confirmation page if saved succesfully
			await paymentDetail.save()
			res.render('checkout', {
				title: "Confirm Order",
				paymentDetail : paymentDetail
			})
		} catch (err) {
			// Throw err if failed to save
			if (err) throw err;
		}
	}).catch((err) => {
		// Throw err if failed to create order
		if (err) throw err;
	})
});


app.post('/verify', async function(req, res, next) {
	body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
	let crypto = require("crypto");
	let expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
							.update(body.toString())
							.digest('hex');

	// Compare the signatures
	if(expectedSignature === req.body.razorpay_signature) {
		// if same, then find the previosuly stored record using orderId,
		// and update paymentId and signature, and set status to paid.
		await PaymentDetail.findOneAndUpdate(
			{ orderId: req.body.razorpay_order_id },
			{
				paymentId: req.body.razorpay_payment_id,
				signature: req.body.razorpay_signature,
				status: "paid"
			},
			{ new: true },
			function(err, doc) {
				// Throw er if failed to save
				if(err){
					throw err
				}
				// Render payment success page, if saved succeffully
				res.render('success', {
					title: "Payment verification successful",
					paymentDetail: doc
				})
			}
		);
	} else {
		res.render('fail', {
			title: "Payment verification failed",
		})
	}
});









app.get("/message" , function(req , res){
    // if(req.isAuthenticated()){
    //    res.render("message")   
    //   }else{
    //       res.redirect("/studentlogin");
    //   }
    if(req.isAuthenticated()){
        User.findById(req.user.id ,function(err , foundUser){
        
            if(foundUser){
                res.render("message" , {admin : foundUser});
                // console.log(foundUser.map());
                // console.log(foundUser.event)
                // console.log(admin);
                // console.log(foundUser)
            }
        })
    //   res.render("profile");  
    }else{
        res.redirect("/studentlogin");
    }
   
});


app.get("/event" , function(req , res){
    if(req.isAuthenticated()){

        User.findById(req.user.id ,function(err , foundUser){
        
        if(foundUser){
            res.render("event" , {admin : foundUser});
            // console.log(foundUser.map());
            // console.log(foundUser.event)
            // console.log(admin);
            // console.log(foundUser)
        }
    })
        // res.render("event")  ;
    }else{
        res.redirect("/studentlogin");
      }
    
    
});



app.get("/addevent" , function(req , res){
    // if(req.isAuthenticated()){
    //    res.render("addevent") ;  
    //   }else{
    //       res.redirect("/studentlogin");
    //   }
    if(req.isAuthenticated()){
        User.findById(req.user.id ,function(err , foundUser){
        
            if(foundUser){
                res.render("addevent" , {admin : foundUser});
                // console.log(foundUser.map());
                // console.log(foundUser.event)
                // console.log(admin);
                // console.log(foundUser)
            }
        })
    //   res.render("profile");  
    }else{
        res.redirect("/studentlogin");
    }
    
});


app.post("/addevent" , function(req, res){
    const submittedevent = req.body.event;
    const submittedsdate = req.body.startdate;
    const submittededate = req.body.enddate;
    const submittedorganizer = req.body.organizer;

    // console.log(req.user.id);
    User.findById(req.user.id , function(err , foundUser){
        if(err){
            console.log(err);
        } else{
            if(foundUser){
                foundUser.event.push(submittedevent)
                foundUser.sdate.push(submittedsdate)
                foundUser.edate.push(submittededate)
                foundUser.organizer.push(submittedorganizer)
                // console.log(submittedevent);
                // foundUser.events.push(submittedevent , submittedsdate , submittededate ,submittedorganizer)
                foundUser.save(function(){
                    res.redirect("/event");
                });
                // foundUser.event.push(submittedevent)
            }
        }
    });
});




app.get("/eventdetail/:id" , function(req, res){
    // const id = req.params.id;
    // console.log(id);

    if(req.isAuthenticated()){

        const id = req.params.id;
        // console.log(id);
        User.findById(req.user.id ,function(err , foundUser){
        
        if(foundUser){
            res.render("eventdetail" , {admin : foundUser , idNo : id});
            // console.log(foundUser.map());
            // console.log(foundUser.event)
            // console.log(admin);
            // console.log(foundUser)
            // console.log(id)
        }
    })
        // res.render("event")  ;
    }else{
        res.redirect("/studentlogin");
      }
})

app.get("/eventdelete/:id" , function(req, res){
    if(req.isAuthenticated()){

        const id = req.params.id;
        console.log(id);
        User.findById(req.user.id ,function(err , foundUser){
        
        if(foundUser){
            foundUser.event.pop(id)
            foundUser.sdate.pop(id)
            foundUser.edate.pop(id)
            foundUser.organizer.pop(id)
                // console.log(submittedevent);
                // foundUser.events.push(submittedevent , submittedsdate , submittededate ,submittedorganizer)
            foundUser.save(function(){
                res.redirect("/event");

            });
        }
    })
        // res.render("event")  ;
    }else{
        res.redirect("/studentlogin");
      }

})



app.get('/logout', function (req, res) {
    req.logOut();
    res.status(200).clearCookie('connect.sid', {
      path: '/'
    });
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });


app.get("/notes" ,function(req ,res){
    // res.render("notes")
    if(req.isAuthenticated()){
        User.findById(req.user.id ,function(err , foundUser){
        
            if(foundUser){
                res.render("notes" , {admin : foundUser});
                // console.log(foundUser.map());
                // console.log(foundUser.event)
                // console.log(admin);
                // console.log(foundUser)
            }
        })
    //   res.render("profile");  
    }else{
        res.redirect("/studentlogin");
    }
});

app.get("/notes/mpmc" , function(req,res){
    // res.render("mpmc")
    if(req.isAuthenticated()){
        User.findById(req.user.id ,function(err , foundUser){
        
            if(foundUser){
                res.render("mpmc" , {admin : foundUser});
                // console.log(foundUser.map());
                // console.log(foundUser.event)
                // console.log(admin);
                // console.log(foundUser)
            }
        })
    //   res.render("profile");  
    }else{
        res.redirect("/studentlogin");
    }
});
app.get("/result" , function(req,res){
    // res.render("result")
    if(req.isAuthenticated()){
        User.findById(req.user.id ,function(err , foundUser){
        
            if(foundUser){
                res.render("result" , {admin : foundUser});
                // console.log(foundUser.map());
                // console.log(foundUser.event)
                // console.log(admin);
                // console.log(foundUser)
            }
        })
    //   res.render("profile");  
    }else{
        res.redirect("/studentlogin");
    }
});
app.get("/semesterresult" , function(req,res){
    // res.render("semesterresult")
    if(req.isAuthenticated()){
        User.findById(req.user.id ,function(err , foundUser){
        
            if(foundUser){
                res.render("semesterresult" , {admin : foundUser});
                // console.log(foundUser.map());
                // console.log(foundUser.event)
                // console.log(admin);
                // console.log(foundUser)
            }
        })
    //   res.render("profile");  
    }else{
        res.redirect("/studentlogin");
    }
});



app.listen(3005, function(){
    console.log("server is running on port 3005")
});