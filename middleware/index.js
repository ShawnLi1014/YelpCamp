//All the middleware goes here
var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");

middlewareObj.checkCampgroundOwnership = function (req, res, next){
    //Check if the user logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect("back");
            }else{
                if(err||!foundCampground){
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
                //Does the user own the campground
                if(foundCampground.author.id.equals(req.user._id)){
                    return next();
                }else{
                    req.flash("error", "You don't have permission to do that!")    
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next){
        //Check if the user logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comments_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            }else{
                if(err||!foundComment){
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
                //Does the user own the comment
                if(foundComment.author.id.equals(req.user._id)){
                    return next();
                }else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

module.exports = middlewareObj