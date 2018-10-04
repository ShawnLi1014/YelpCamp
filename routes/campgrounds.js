var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
//Automaticlly require index of a directory
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

var multer = require("multer");
var storage = multer.diskStorage({
    filename:function(req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb){
    //accept image files only
    if(!file.originalname.match(/\.(jpg|jepg|png|gif)$/i)){
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({storage:storage, fileFileter: imageFilter});

var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name:"dmbgibah9",
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_KEY_SECRET
});

//INDEX Route - show all campgrounds
router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allCampgrounds.length < 1) {
                        req.flash("error", "No campgrounds match that query, please try again");
                        return res.redirect("/campgrounds");
                    }
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: false
                    });
                }
            });
        });
    }
});
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var desc = req.body.description;
  var price = req.body.price;
  var author = {
      id: req.user._id,
      username: req.user.username
  };
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    cloudinary.v2.uploader.upload(req.file.path, function(err, result){
        var image = result.secure_url;
        var imageId = result.public_id;
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        }
 
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name: name, image: image, imageId: imageId, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds/" + newlyCreated.id);
            }
        });
    });
  });
});

//NEW-show form to make a new dog
router.get("/new", middleware.isLoggedIn,function(req, res) {
    res.render("campgrounds/new");
});

//SHOW - show more info about one campgound
router.get("/:id", function(req,res){
    //find the campground with the id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err){
           console.log(err);
       } 
       else{
           console.log(foundCampground);
           res.render("campgrounds/show", {campground:foundCampground});
       }
    });
});

//Edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership,function(req, res) {
    Campground.findById(req.params.id,function(err, foundCampground){
        if(err||!foundCampground){
            console.log(err);
            req.flash("error", "Sorry, that campground does not exist!");
            res.redirect("back");
        }
        res.render("campgrounds/edit", {campground:foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
    Campground.findById(req.params.id,  async function(err, campground) {
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            if(req.file){
                try{
                    //delete the file from cloudinary
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    //upload a new file
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                }catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
        }
        console.log(req.body.name)
        campground.lat = data[0].latitude;
        campground.lng = data[0].longitude;
        campground.location = data[0].formattedAddress;
        campground.name = req.body.campground.name;
        campground.price = req.body.campground.price;
        campground.description = req.body.campground.description;
        campground.save();
        req.flash("success","Successfully Updated!");
        res.redirect("/campgrounds/" + campground._id);
    });
  });
});

//Destroy Campground route
router.delete("/:id", middleware.checkCampgroundOwnership,function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            res.redirect("back");
        }
        try{
            await cloudinary.v2.uploader.destroy(campground.imageId);
            campground.remove();
            req.flash("success", "Campground has been successfully deleted.")
            res.redirect("/campgrounds");
        }catch(err){
            if(err){
                req.flash("error", err.message)
                return res.redirect("back");
            }
        }
        res.redirect("/campgrounds");
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;