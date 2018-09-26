var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
//Automaticlly require index of a directory
var middleware = require("../middleware");

//INDEX Route - show all campgrounds
router.get("/", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allcampgrounds){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/index", {campgrounds:allcampgrounds, currentUser:req.user, page:"campgrounds"});
        }
    })
})
//CREATE-add new campgrounds to DB
router.post("/", middleware.isLoggedIn,function(req, res){
   //get data from for and add to campgrounds array
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc = req.body.description;
   var location = req.body.location;
   var author = {
       id:req.user._id,
       username:req.user.username
   };
   var newCampground = {name:name, price:price, image: image, description: desc, author:author, location:location};
   //Create a new campground and save it to the DB
   Campground.create(newCampground, function(err, newlyCreated){
       if(err){
           console.log(err);
       }
       else{
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
       }
   })

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

//Update campground route
router.put("/:id", middleware.checkCampgroundOwnership,function(req, res){
    //find and update the current campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if(err){
            res.redirect("back");
        }
        //redirect
        res.redirect("/campgrounds/" + req.params.id);
    });
});

//Destroy Campground route
router.delete("/:id", middleware.checkCampgroundOwnership,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("back");
        }
        res.redirect("/campgrounds");
    });
});


module.exports = router;