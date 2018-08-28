var express = require("express");
var app = express();
var bodyParser = require("body-parser")
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
var campgrounds = [
        {name:"Salmon Creek", image:"http://www.basslakeatyosemite.com/wp-content/uploads/2018/05/yosemite-merced-1140x2000.jpg"},
        {name:"Granite Hill", image:"https://www.tripsavvy.com/thmb/6s3juhonsipIcOTRoNctv8nkG3Q=/2093x1435/filters:no_upscale():fill(transparent,1)/yosemite-national-park-56a8171b5f9b58b7d0f088fc.jpg"},
        {name:"Granite Hill", image:"https://www.tripsavvy.com/thmb/6s3juhonsipIcOTRoNctv8nkG3Q=/2093x1435/filters:no_upscale():fill(transparent,1)/yosemite-national-park-56a8171b5f9b58b7d0f088fc.jpg"},
        {name:"Granite Hill", image:"https://www.tripsavvy.com/thmb/6s3juhonsipIcOTRoNctv8nkG3Q=/2093x1435/filters:no_upscale():fill(transparent,1)/yosemite-national-park-56a8171b5f9b58b7d0f088fc.jpg"},
        {name:"Yosemite", image:"https://www.visitcalifornia.com/sites/default/files/styles/welcome_image/public/VCW_D_Yosemite_Hero_20140503_Yosemite_hero_1280x642_1.jpg"},
        {name:"Yosemite", image:"https://www.visitcalifornia.com/sites/default/files/styles/welcome_image/public/VCW_D_Yosemite_Hero_20140503_Yosemite_hero_1280x642_1.jpg"},
        {name:"Yosemite", image:"https://www.visitcalifornia.com/sites/default/files/styles/welcome_image/public/VCW_D_Yosemite_Hero_20140503_Yosemite_hero_1280x642_1.jpg"},
        {name:"Yosemite", image:"https://www.visitcalifornia.com/sites/default/files/styles/welcome_image/public/VCW_D_Yosemite_Hero_20140503_Yosemite_hero_1280x642_1.jpg"}
    ];

app.get("/", function(req,res){
    res.render("landing")
});

app.get("/campgrounds", function(req, res){

    res.render("campgrounds", {campgrounds:campgrounds});
})

app.post("/campgrounds", function(req, res){
   //get data from for and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var newCampground = {name:name, image: image};
   campgrounds.push(newCampground);
   //redirect back to campgrounds page
   res.redirect("/campgrounds");
});

app.get("/campgrounds/new", function(req, res) {
    res.render("new");
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp server has started");
})