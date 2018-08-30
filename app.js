var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/yelp_camp");
app.set("view engine", "ejs");

//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String
});

var Campground = mongoose.model("Campground", campgroundSchema);

app.use(bodyParser.urlencoded({extended:true}));

// Campground.create(
//     {
//         name:"River side", 
//         image:"http://visitmckenzieriver.com/oregon/wp-content/uploads/2015/06/paradise_campground.jpg",
//         description:"This is a beautiful river-side campground"
//     }, function(err, campground){
//         if(err){
//             console.log(err);
//         }
//         else{
//             console.log("New campground created");
//             console.log(campground);
//         }
//     });

app.get("/", function(req,res){
    res.render("landing")
});
//INDEX Route - show all campgrounds
app.get("/campgrounds", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allcampgrounds){
        if(err){
            console.log(err);
        }
        else{
            res.render("index", {campgrounds:allcampgrounds});
        }
    })
})
//CREATE-add new campgrounds to DB
app.post("/campgrounds", function(req, res){
   //get data from for and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var newCampground = {name:name, image: image, description: desc};
   //Create a new campground and save it to the DB
   Campground.create(newCampground, function(err, newlyCreated){
       if(err){
           console.log(err);
       }
       else{
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
       }
   })

});
//NEW-show form to make a new dog
app.get("/campgrounds/new", function(req, res) {
    res.render("new");
})
//SHOW - show more info about one campgound
app.get("/campgrounds/:id", function(req,res){
    //find the campground with the id
    Campground.findById(req.params.id, function(err, foundCampground){
       if(err){
           console.log(err);
       } 
       else{
           res.render("show", {campground:foundCampground});
       }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp server has started");
})