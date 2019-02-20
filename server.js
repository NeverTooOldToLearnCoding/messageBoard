var session = require('express-session');
// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();

app.use(session({
  secret: 'kingKrool',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Require Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basic_mongoose',{ useNewUrlParser:true});

const CommentSchema = new mongoose.Schema({
  name: {type: String, required: [true, "Comment must have a name"], minlength: [1, "Name must have at least 1 characters"]},
  comment: {type: String, required: [true, "Comment cannot be blank"], minlength: [1, "Comment must have at least 1 characters"]},
}, {timestamps: true})

const MessageSchema = new mongoose.Schema({
  name: {type: String, required: [true, "Message must have a name"], minlength: [1, "Name must have at least 1 characters"]},
  message: {type: String, required: [true, "Message cannot be blank"], minlength: [1, "Message must have at least 1 characters"]},
  comments: [CommentSchema]
}, {timestamps: true})

const Message = mongoose.model('Message',MessageSchema);
const Comment = mongoose.model('Comment',CommentSchema);

// Use native promises
mongoose.Promise = global.Promise;

// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes

//require express flash
const flash = require('express-flash');
app.use(flash());

// Root Request
app.get('/', function(req, res) {
    // This is where we will retrieve the users from the database and include them in the view page we will be rendering.
  
  Message.find({}).sort({updatedAt:'desc'}).exec(function(err, messages) {
    if(err) {
      console.log('Something went wrong');
    }else{
    res.render('index',{data:messages});
    }
  })

})

// // view animal form 
// app.get('/mongooses/new', function(req, res) {

//       res.render('form');
// });

// //display information about one animal
// app.get('/mongooses/:id', function(req, res) {
//     // This is where we will retrieve the users from the database and include them in the view page we will be rendering.

//   Animal.find({_id:req.params.id}).sort({updatedAt:'desc'}).exec(function(err, animal) {
//     if(err) {
//       console.log("Something went wrong.");
//     }else{
//     // This is the method that finds all of the users from the database
//     // Notice how the first parameter is the options for what to find and the second is the
//     //   callback function that has an error (if any) and all of the users
//     // Keep in mind that everything you want to do AFTER you get the users from the database must
//     //   happen inside of this callback for it to be synchronous 
//     // Make sure you handle the case when there is an error, as well as the case when there is no error
//     console.log(animal);
//     res.render('view',{animal:animal});
//     }
//   })
// })


// Add Message to DB 
app.post('/processMessage', function(req, res) {
  console.log("POST DATA", req.body);
  // create a new User with the name and age corresponding to those from req.body
  var message = new Message(req.body);

  message.save(function(err){

        if(err){

          // if(req.body.name.length < 1){
          //   req.flash('name',"Name cannot be blank.");
          // }
          // if(req.body.message < 1){
          //   req.flash('message',"Message cannot be blank.");
          // }
          // if(req.body.comment < 1){
          //   req.flash('comment',"Comment cannot be blank.");
          // }
          console.log("We have an error!", err);
          // adjust the code below as needed to create a flash message with the tag and content you would like
          for(var key in err.errors){
            req.flash('registration', err.errors[key].message);
          }
            res.redirect('/');
        }
        else {
            console.log("Message was successfully saved!");
            res.redirect('/');
        }
    });
});

// Add Comment to DB 
app.post('/processComment/:id', function(req, res) {

  Message.updateOne({_id:req.params.id}, 
    {$push:{comments:{name:req.body.name,comment:req.body.comment}}}, function(err){
 // This code will run when the DB has attempted to update the matching record.
   if(err){
    console.log("Something went wrong");
   }else{
    console.log("Successfully added comment on message");

    res.redirect("/");
    }

  })
});


// //action attribute for editing animal 
// app.post('/mongooses/:id', function(req, res) {

//   Animal.updateOne({_id:req.params.id}, 
//     {$set:{animal:req.body.animal,food:req.body.food,personality:req.body.personality,imgurl:req.body.imgurl}}, function(err){
//  // This code will run when the DB has attempted to update the matching record.
//    if(err){
//     console.log("Something went wrong");
//    }else{
//     console.log("Successfully edited animal");

//     res.redirect("/");
//     }
//   })

// });



// // Edit animal 
// app.get('/mongooses/edit/:id', function(req, res) {
//   req.params.id;

//   Animal.find({_id:req.params.id}).sort({updatedAt:'desc'}).exec(function(err, animal) {
//     if(err) {
//       console.log("Something went wrong.");
//     }else{
//     // This is the method that finds all of the users from the database
//     // Notice how the first parameter is the options for what to find and the second is the
//     //   callback function that has an error (if any) and all of the users
//     // Keep in mind that everything you want to do AFTER you get the users from the database must
//     //   happen inside of this callback for it to be synchronous 
//     // Make sure you handle the case when there is an error, as well as the case when there is no error
//     console.log(animal);
//     res.render('edit',{animal:animal});
//     }
//   })
// });

// //action attribute for editing animal 
// app.post('/mongooses/:id', function(req, res) {

//   Animal.updateOne({_id:req.params.id}, 
//     {$set:{animal:req.body.animal,food:req.body.food,personality:req.body.personality,imgurl:req.body.imgurl}}, function(err){
//  // This code will run when the DB has attempted to update the matching record.
//    if(err){
//     console.log("Something went wrong");
//    }else{
//     console.log("Successfully edited animal");

//     res.redirect("/");
//     }
//   })

// });

// // Delete animal 
// app.get('/mongooses/destroy/:id', function(req, res) {

//   console.log("This route is working!");
//   console.log(req.params.id);

//   Animal.deleteOne({_id:req.params.id},function(err){
//     if(err) {
//       console.log("Something went wrong.");
//     }else{
//     // This is the method that finds all of the users from the database
//     // Notice how the first parameter is the options for what to find and the second is the
//     //   callback function that has an error (if any) and all of the users
//     // Keep in mind that everything you want to do AFTER you get the users from the database must
//     //   happen inside of this callback for it to be synchronous 
//     // Make sure you handle the case when there is an error, as well as the case when there is no error
//     console.log("Successfully deleted animal.");
//     res.redirect('/');
//     }
//   })

// });





// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
