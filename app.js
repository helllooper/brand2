var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var expressSanitizer = require("express-sanitizer");
var expressSession = require("express-session");
var methodOverride = require("method-override");
var mongoose = require("mongoose");
var multer = require('multer');
var cloudinary = require('cloudinary');
var passport = require("passport");
var nodemailer = require("nodemailer");
var facebookStrategy = require("passport-facebook").Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var flash = require("connect-flash");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var Filter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4)$/i)) {
        return cb(new Error('This file is not allowed!'), false);
    }
    cb(null, true);
};
var limitOption =
    {fieldSize: 1000000000, fileSize: 1000000000};
var upload = multer({ storage: storage, limits:limitOption});
cloudinary.config({ 
  cloud_name: 'dp3abctzf', 
  api_key:"977678664345788", 
  api_secret:"diAlXivHgY5cQTaDl1H-JhdDCvc"
});


// mongoose.connect("mongodb://localhost:27017/brand2", {useNewUrlParser: true});
mongoose.connect("mongodb://EmadHassan:2470617ayman@ds017165.mlab.com:17165/brand2");
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(expressSession({
    secret:"Emad's blog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new facebookStrategy({
    clientID: "367943490459917",
    clientSecret: "b31dc8b58e1f79b26b0cbb755edf310f",
    callbackURL: "https://brand2-onym.c9users.io/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email', 'picture.type(large)']
  },
  function(accessToken, refreshToken, profile, done) {
      User.findOne({Id:profile.id}, function(err, user){
          if(err){
              return done(err);
          }
          if(user){
              return done(null, user);
          }
          else{
              console.log(profile);
              User.create({Id:profile.id, token:accessToken, email:profile.emails[0].value, name:profile.displayName, pic:profile.photos[0].value}, function(err, newUser){
                  if(err){
                      console.log(err);
                  }
                  else {
                      return done(null, newUser);
                  }
              });
          }
      });
  }
));

passport.use(new GoogleStrategy({
    clientID: "1001500417798-4p3umifls4bm8m2roh9jg4a57ah5edmq.apps.googleusercontent.com",
    clientSecret: "UgwPj5q7UlH9c3SpzgEbpkU8",
    callbackURL: "https://brand2-onym.c9users.io/auth/google/callback"
  },  function(accessToken, refreshToken, profile, done) {
      User.findOne({Id:profile.id}, function(err, user){
          if(err){
              return done(err);
          }
          if(user){
              return done(null, user);
          }
          else{
              User.create({Id:profile.id, token:accessToken, email:profile.emails[0].value, name:profile.displayName, pic:profile.photos[0].value}, function(err, newUser){
                  if(err){
                      console.log(err);
                  }
                  else {
                      return done(null, newUser);
                  }
              });
          }
      });
  }

));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

var commentSchema = new mongoose.Schema({
    user:String,
    text:String,
    pic:String
});

var articleSchema = new mongoose.Schema({
    title:String,
    type:String,
    brief:String,
    ingredients:String,
    preparation:String,
    image:String,
    imageId:String,
    author:String,
    date:{type: Date, default: Date.now},
    comments:[commentSchema]

});

var Article = mongoose.model("Article", articleSchema);


var usersSchema = new mongoose.Schema({
   Id:String,
   token:String,
   email:String,
   name:String,
   pic:String,
});

var User = mongoose.model("User", usersSchema);

var videosSchema = new mongoose.Schema({
    title: String,
    body:String,
    poster:String,
    url:String,
    videoId:String,
    chef:String,
    date:{type: Date, default: Date.now}
});

var Video = mongoose.model("Video", videosSchema);

// Recipe.create({title: 'How to cook Cauliflower', image:"cauliflower.jpg", author:"Alison Roman"}, function (err, small) {
//     if(err){
//         console.log(err);
//     }
// });

// Dessert.create({title: 'How to cook a Cheese Cake', image:"dessert.jpeg", author:"Alison Roman"}, function (err, small) {
//     if(err){
//         console.log(err);
//     }
// });

// Beverage.create({title: 'How to make a Lemonade', image:"lemonade.jpeg", author:"Alison Roman"}, function (err, small) {
//     if(err){
//         console.log(err);
//     }
// });

app.get("/", function(req, res){
Article.find({type:"food"}, function(err, allFood){
   if(err){
       req.flash("error", err.message);
       res.redirect("back");
       console.log(err);
   }
   else{
       Article.find({type:"dessert"}, function(err, allDesserts){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
              console.log(err);
          } else {
              Article.find({type:"beverage"}, function(err, allBeverages){
                 if(err){
                     req.flash("error", err.message);
                     res.redirect("back");
                     console.log(err);
                 } 
                 else {
                     res.render("home", {food:allFood, desserts:allDesserts, beverages:allBeverages});
                 }
              });
          }
       });
   }
});
});

app.get("/add", isEmad, function(req, res){
   res.render("add"); 
});

app.post("/add", isEmad, upload.single("image"), function(req, res){
   cloudinary.v2.uploader.upload(req.file.path, {invalidate:true}, function(err, result){
       if(err){
           req.flash("error", err.message);
           res.redirect("back");
           console.log(err);
       }
       else{
               var title = req.sanitize(req.body.title);
               var type = req.body.type;
               var brief = req.sanitize(req.body.brief);
               var image = result.secure_url;
               var imageId =result.public_id;
               var ingredients = req.sanitize(req.body.ingredients);
               var preparation = req.sanitize(req.body.preparation);
               var author = req.sanitize(req.body.author);
               var newInput = {title:title, type:type, brief:brief, image:image, imageId:imageId, ingredients:ingredients, preparation:preparation, author:author};
           Article.create(newInput, function(err, article){
               if(err){
                   req.flash("error", err.message);
                   res.redirect("back");
                   console.log(err);
               }
               else{
                   req.flash("success", "An article has been added");
                   res.redirect("/");
               }
           });
       }
   });

   

});

app.get("/food", function(req, res){
   Article.find({type:"food"}, function(err, foundArticles){
       if(err){
           req.flash("error", err.message);
           res.redirect("back");
           console.log(err);
       }
       else {
           res.render("recipes", {articles:foundArticles});
       }
   });
});

app.get("/desserts", function(req, res){
   Article.find({type:"dessert"}, function(err, foundArticles){
       if(err){
           req.flash("error", err.message);
           res.redirect("back");
           console.log(err);
       }
       else{
           res.render("desserts", {articles:foundArticles});
       }
   }); 
});

app.get("/beverages", function(req, res){
   Article.find({type:"beverage"}, function(err, foundArticles){
       if(err){
           req.flash("error", err.message);
           res.redirect("back");
           console.log(err);
       }
       else {
           res.render("beverages", {articles:foundArticles});
       }
   }); 
});

app.get("/addVideo", isEmad, function(req, res){
    res.render("addVideo");
});

app.get("/videos", function(req, res){
    Video.find({}, function(err, allVideos){
       if(err){
           req.flash("error", err.message);
           res.redirect("back");
           console.log(err);
       } 
       else {
           res.render("videos", {videos:allVideos});
       }
    });
});

app.post("/addVideo", isEmad, upload.single('url'),function(req, res){
       cloudinary.v2.uploader.upload(req.file.path, {resource_type:"video", invalidate: true}, function(err, result) {
    if(err){
        req.flash("error", err.message);
        res.redirect("back");
        console.log(err);
    }else {
          // add cloudinary url for the image to the campground object under image property
  req.body.url = result.secure_url;
  req.body.videoId = result.public_id;

  Video.create(req.body, function(err, video) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect('back');
    }
    req.flash("success", "Video has been added");
    res.redirect("/");
  });
    }

}); 
});

app.delete("/videos/:id", isEmad, function(req, res){
    Video.findById(req.params.id, async function(err, video) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(video.videoId, {invalidate:true});
        video.remove();
        req.flash("success", "Video has been removed");
        res.redirect('/videos');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

app.get("/articles/:id" , function(req, res){
    Article.findById(req.params.id, function(err, article){
       if(err){
        req.flash("error", err.message);
        console.log(err);   
       }
       else{
           res.render("show", {article:article});
       }
    });
});

app.delete("/articles/:id", isEmad, function(req, res){
        Article.findById(req.params.id, async function(err, article){
           if(err){
               req.flash("error", err.message);
               res.redirect("back");
               console.log(err);
           } 
           
           else {
                await cloudinary.v2.uploader.destroy(article.imageId, {invalidate:true});
                article.remove();
                req.flash("success", "Article has been removed");
                res.redirect("/");
           }
        });
});

app.post("/articles/:id",isLoggedIn, function(req, res){
    req.body.text = req.sanitize(req.body.text);
    req.body.user = req.user.name;
    req.body.pic = req.user.pic;
    Article.findById(req.params.id, function(err, article){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
            console.log(err);
        }
        else{
            console.log(req.body);
            article.comments.push(req.body);
            article.save();
            req.flash("success", "Comment has been added");
            res.redirect("/articles/" + req.params.id);
        }
    });
});

app.delete("/articles/:id/:commentId", isEmad, function(req, res){
   Article.findById(req.params.id, function(err, foundArticle){
       if(err){
           req.flash("error", err.message);
           res.redirect("back");
           console.log(err);
       } else{
           foundArticle.comments.id(req.params.commentId).remove();
           foundArticle.save(function(err){
               if(err){
                   req.flash("error", err.message);
                   res.redirect("back");
                   console.log(err);
               }
           });
           req.flash("success", "Comment has been deleted");
           res.redirect("/articles/" + req.params.id);
       }
   }); 
});

app.get("/contact", function(req, res){
   res.render("contact"); 
});

app.post("/contact", function(req, res){
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'emadsblog@gmail.com',
          pass: "emad1987emad?"
        }
      });
      var mailOptions = {
        to: "helllooper@gmail.com",
        from: 'emadsblog@gmail.com',
        subject: "Brand Website Contact",
        text:"from: " + req.body.name + "\n\n" + req.body.message + "\n\n" + req.body.email,
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        }
        else {
            console.log('mail sent');
            req.flash("success", "Your message has been sent");
            res.redirect("/");
        }
        
        
      });
});

app.get("/ourTeam", function(req, res){
   res.render("team"); 
});


app.get("/auth/login", function(req, res){
    res.render("login");
});

app.get('/auth/facebook', passport.authenticate('facebook', {authType: 'rerequest', scope: ['email']}));


app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login',successFlash: "You are logged in successfully",
    failureFlash: true }));

app.get('/auth/google',
  passport.authenticate('google', { scope:["profile", "email"] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login',successFlash: "You are logged in successfully",
    failureFlash: true })); 


app.get("/account/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged out successfully");
   res.redirect("/");
});

app.get("/search", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Article.find({title:regex}, function(err, foundArticles){
            if(err){
                console.log(err);
                req.flash("error",err.message);
                res.redirect("back");
            }
            else{
                res.render("search", {articles:foundArticles});
            }
        });
    }else {
        req.flash("error", "Enter a word to search");
        res.redirect("back");
    }
});

function isLoggedIn (req, res, next){
 if(req.isAuthenticated()){
     return next();
 }
 req.flash("error", "you must be logged in");
 res.redirect("/auth/login");
}

function isEmad (req, res, next){
    if(res.locals.currentUser && res.locals.currentUser.email === "helllooper@gmail.com"){
        return next();
    }
    else {
        req.flash("error", "Unauthorized");
        res.redirect("back");
    }
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started");
});