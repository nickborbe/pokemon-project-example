const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcryptjs = require('bcryptjs');
const mongoose = require("mongoose");
const isLoggedIn = require("../utils/isLoggedIn");
const axios = require("axios");



router.get("/signup", (req, res, next)=>{
    res.render("users/signup");
});

router.post("/signup", async (req, res, next)=>{
    const username = req.body.username;
    const email = req.body.email;
    

    // the most direct and manual way to validate forms is in the post route where they submit
    // the process is as simple as taking a look at req.body, making sure it has what you want it to have
    // and if it doesnt have the right stuff, you simple redirect and show a failure message
    const password = req.body.password;
    if(password.length < 6){
      req.flash("error", "password must be more than 5 characters");
      res.redirect("/signup");
      return;
    }

    let re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if(!re.test(password)){
      req.flash("error", "password must contain lowercase, capital, numerals, and special characters");
      res.redirect("/signup");
      return;
    }

    
    const salt = await bcryptjs.genSalt(10)

    const hashedPassword = await bcryptjs.hash(password, salt)

    const newlyCreatedUser = await User.create({username:username, password: hashedPassword, email: email})
  
          // copied and pasted most of this email code from rapiAPI
          const options = {
            method: 'POST',
            url: 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': process.env.RAPIDAPIKEY,
              'X-RapidAPI-Host': 'rapidprod-sendgrid-v1.p.rapidapi.com'
            },
            data: {
              personalizations: [
                {
                  to: [
                    {
                      email: req.body.email
                    }
                  ],
                  subject: 'Thanks for Signing up'
                }
              ],
              from: {
                email: 'noreply@pokemonapp.co'
              },
              content: [
                {
                  type: 'text/html',
                  value: `<h2>Thank you for signing up</h2>
                  <h6>Your username is ${req.body.username}</h6>
                  <p>Please click <a href="http://localhost:3000/activate-account/${newlyCreatedUser._id}">here</a> to verify your email</p>
                  `
                }
              ]
            }
          };

          try {
            const response = await axios.request(options);
            console.log(response.data);
            req.flash("success", "Sign-up was successful, please verify your email");
            res.redirect("/");
          } catch (error) {
            console.error(error);
            if (error instanceof mongoose.Error) {
              // the way to create a message with req.flash to show user feedback
              // after a redirect is like this
              req.flash("error", error.message);
              // first argument is the name of the key inside the req.flash object
              // second argument is the value
              res.redirect("/signup");
          }
          }
});


router.get("/login", (req, res, next)=>{
    res.render("users/login.hbs");
});



router.post("/login", (req, res, next)=>{
    
    const username = req.body.username;
    const password = req.body.password;
    

    // the first thing we do is just to simply search through our databse and see if we find a user with a username matching what the person just typed in
    User.findOne({ username: req.body.username })
    .then(foundUser => {
        // this .then only happens after we search for a user with username equal to 
        // req.body.username and the promise resolves successfully
      if (!foundUser) {
        // this if only happens we successfully queries the databse and there is no user with that username
        req.flash("error", "Username Not Found");
        // for now we'll just console log an error message if we cant find a user with that username
        // we will add a package for error messages later
        res.redirect("/login");
        return;
        // the following else if only happens if there was an actual user found with 
        // username equal to req.body.username
      } else if (bcryptjs.compareSync(req.body.password, foundUser.password)) {
        // inside thise else if only happens if the password matches
        
        if(!foundUser.active){
          req.flash("error", "Account is not active, please check your email to verify your account");
          res.redirect("/login");
          return;
        } else {
          req.session.currentUser = foundUser;
          // ^ this is the magic right here this is how we log in
          req.flash("success", "Successfully Logged In");
          res.redirect('/');
        } 
      } else {
        // this else only happens if we found the user with the username but the passwords didnt match
        req.flash("error", "Password Do Not Match");
        res.redirect("/login");
        
      }
    })
    .catch(error => next(error));
});



router.post("/logout", (req, res, next)=>{
    req.session.destroy();
    res.redirect("/");
  });


  router.get("/user-profile", isLoggedIn, (req, res, next)=>{
    User.findById(req.session.currentUser._id).populate("pokemon")
    .then((theUser)=>{
      res.render("users/profile", {theUser: theUser})
    })
  });


  router.get("/see-users", (req, res, next)=>{
    if(!(req.session.currentUser && req.session.currentUser.Admin)){
      res.redirect("/");
      return;
    }
    User.find()
    .then((allUsers)=>{
      res.render("users/all-users", {users: allUsers});
    }).catch((err)=>next(err));
  })


  router.post("/delete-user", (req, res, next)=>{
    if(!(req.session.currentUser && req.session.currentUser.Admin)){
      res.redirect("/");
      return;
    }
    // when we deleted pokemon we put the ID in the params
    // but this time were putting in the req.body using a hidden input
    User.findByIdAndRemove(req.body.theUserID)
    .then(()=>{
      res.redirect("/see-users")
    }).catch((err)=>next(err));
  });



  router.get("/activate-account/:id", (req, res, next)=>{
    User.findByIdAndUpdate(req.params.id, {active: true})
    .then(()=>{
      res.redirect("/login");
    }).catch((err)=>next(err));
  });



  router.get("/reset-password/get-link", (req, res, nexr)=>{
    res.render("users/reset-password");
  });


  router.post("/reset-password/get-link", async (req, res, next)=>{

    try{
      const theUser = await User.findOne({$and: [{username: req.body.username}, {email:req.body.email}]});
      if(!theUser){
        req.flash("error", "sorry incorrect username/email combo");
        res.redirect("/reset-password/get-link");
        return
      } else {
        const options = {
          method: 'POST',
          url: 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
          headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.RAPIDAPIKEY,
            'X-RapidAPI-Host': 'rapidprod-sendgrid-v1.p.rapidapi.com'
          },
          data: {
            personalizations: [
              {
                to: [
                  {
                    email: req.body.email
                  }
                ],
                subject: 'Reset Password Poke-App'
              }
            ],
            from: {
              email: 'noreply@pokemonapp.co'
            },
            content: [
              {
                type: 'text/html',
                value: `<h2>You have requested to reset your password</h2>
                <h6>Your username is ${req.body.username}</h6>
                <p>Please click <a href="http://localhost:3000/reset-password/${theUser._id}">here</a> to reset you password</p>
                `
              }
            ]
          }
        };
      

      try {
        const response = await axios.request(options);
        console.log(response.data);
        res.redirect("/");
      } catch (error) {
        console.error(error);
      }
    }
  }catch(err){
    next(err)
  }
  });



  router.get("/reset-password/:id", (req, res, next)=>{
    const userID = req.params.id;
    res.render("users/reset-password-final", {userID: userID});
  });


  router.post("/reset-password-final", (req, res, next)=>{

    bcryptjs.genSalt(10)
    .then((salt)=>{
      bcryptjs.hash(req.body.password1, salt)
      .then((hashedPassword)=>{
        User.findByIdAndUpdate(req.body.userID, {password: hashedPassword})
        .then(()=>{
          res.redirect("/login")
        }).catch(err=>next(err));
      })
    })

    

  })


  
  






module.exports = router;