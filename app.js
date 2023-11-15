const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _=require("lodash");
const { Schema } = mongoose;
 
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {useNewUrlParser : true});
 
const itemsSchema = new Schema({
  
  name:  String
});
 
const Item = mongoose.model('Item', itemsSchema);
const item1 = new Item({
  
  name:"Welcome to your ToDo List!"});
const item2 = new Item({
  
  name:"Hit the + button to add new item."});
const item3 = new Item({
 
  name:"<-- Hit this to delete an item."});
 
const defaultItems = [item1, item2, item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}
 
const List=mongoose.model("List",listSchema);
 
 
const workItems = [];
 
app.get("/", function(req, res) {
  Item.find({}).then(function(FoundItem){
    if(FoundItem.length==0){
    Item.insertMany(defaultItems) .then(function(){
      console.log("Data inserted")  // Success
    })
    .catch(function(error){
      console.log(error)      // Failure
    });
    res.redirect("/");
   }
   else {
    res.render("list", {listTitle: "Today", newListItems: FoundItem});  
   }
  })
});

app.get("/:customListName",(req,res)=>{
    const customListName=_.capitalize(req.params.customListName);

   
    List.findOne({name:customListName}).then(function(FoundList){
      if(!FoundList){
        //create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
          })
          list.save().then(function(){
            console.log("List added") 
          })
          .catch(function(error){
            console.log(error)     
          });
          res.redirect("/"+customListName);
      }
      else{
        //list already exist
        res.render("list",{listTitle:FoundList.name, newListItems: FoundList.items});
      }
    })
    .catch(function(error){
      console.log(error)     
    })




});
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save().then(function(){
      res.redirect("/");
    })
    .catch(function(error){
      console.log(error);
  
    });
  }
  else{
    List.findOne({name:listName}).then(function(FoundList){
      FoundList.items.push(item);
      FoundList.save().then(function(){
        res.redirect("/"+listName);
      })
    })
    .catch(function(error){
      console.log(error);
  
    });
  }
  
  
  
});

app.post("/delete",(req,res)=>{
  const checkedboxid=req.body.checkbox;
  const listName=req.body.listName;
  

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedboxid) .then(function(){
      console.log("Data removed") 
      res.redirect("/"); // Success
    })
    .catch(function(error){
      console.log(error)      // Failure
    });
    
  }
  else{
   List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedboxid}}}).then(function(){
    console.log("Data removed from particular list") 
    res.redirect("/"+listName); // Success
  })
  .catch(function(error){
    console.log(error)      // Failure
  });
  



  }


  
});

 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});