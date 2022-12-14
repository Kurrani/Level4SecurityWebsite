//jshint esversion:6

// this is what will allow us to hide our secret keys
// to use it go to the main directory and write touch .env
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// an encryption package from mongoose npm i mongoose-encryption
// const encrypt = require("mongoose-encryption");

// This is for Hashing only
// const md5 = require("md5");

// // This is Hashing while using Salt as well
// const bcrypt = require("bcrypt");
// // Salt created with random
// const saltRounds = 10;

//  When USING COOKIES Do This using Passport
const session = require("express-session");
const passport = require ("passport");
const passportLocalMongoose = require("passport-local-mongoose");




const app = express();
// //Prints the API Key in .env file
// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

// Place the following here.Always above mongoose.connect
app.use(session({
  secret: "Our Little Secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// Object created from mongoose schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Define a secrets
// Put this in the .env
// const secret = "Thisisourlittlesecret.";

// read plugin in mongoose website
// Do this before the model
// To encrypt multiple fields just add the name/ variable inside the encryptedFields array
// This goes with mongoose-encryption
 // userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password'] });



app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  // if user is logged in, let him see the secrets page or send him to login
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

// logout
app.get("/logout", function(req, res){
  req.logout(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });


});

// // if user have been successfuly created Show him/her the secret page
 app.post("/register", function(req, res){

// USING HASHING AND SALTING
// // Here is for hashing and salting password
// bcrypt.hash(req.body.password, saltRounds, function(err, hash){
//   const newUser = new User({
//     email: req.body.username,
//     //This will create a hash function
//     // password: md5 (req.body.password)
//
//     // This is for hash + salt
//     password: hash
//   });
//   newUser.save(function(err){
//     if(err){
//       console.log(err);
//     }else{
//       res.render("secrets");
//     }
//   });
// });

  // USING LEVEL 1
  // const newUser = new User({
  //   email: req.body.username,
  //   //This will create a hash function
  //   password: md5 (req.body.password)
  // });
  //
  //
  // newUser.save(function(err){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     res.render("secrets");
  //   }
  // });

// From Passport local mongoose
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      // This is the keep me logged in
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })

});

// create a user id and password.

app.post( "/login", function(req, res){

// Using Hashing and salting
//   const username = req.body.username;
//   // login with only hashing
//   // const password = md5(req.body.password);
//
//   const password = req.body.password;
//
// // verify if the user exists and sign in if it is good
//   User.findOne( {email: username}, function(err, foundUser){
//     if(err){
//       console.log("This is the Error: "+err);
//       // console.log(username);
//     }else{
//       if(foundUser){
//         // regular found without bcrypt
//         // if(foundUser.password  === password){
//         //   res.render("secrets");
//         // }
//
//         // using bcrypt
//         bcrypt.compare(password, foundUser.password, function(err, result){
//           if(result === true){
//             res.render("secrets");
//           }
//         });
//
//       }else{
//         console.log("Cannot find User name");
//       }
//     }
//   });

  const user = new User({
    username:req.body.username,
    password: req.body.password
  });
  // comes from passport
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })

});




app.listen(3000, function(){
  console.log("Server Has Started on port 3000");
});
