const express = require("express");
const app = express();
const connectDb = require("./database/mongoose");
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Product = require("./models/Product.model");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const CheckAndAddOffers = require('./services/cartService')
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/rackspace-basket',
    collection: 'sessions'
});



store.on('error', function(error) {
    console.log(error);
  });

const PORT = 8080;
app.use(cookieParser());
app.use(require('express-session')({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  resave: true,
  saveUninitialized: true
}));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Access the session as req.session
app.get('/', function(req, res, next) {
    if (req.session.views) {
      req.session.views++
      res.setHeader('Content-Type', 'text/html')
      res.write('<p>views: ' + req.session.views + '</p>')
      res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
      res.end()
    } else {
      req.session.views = 1
      res.end('welcome to the session demo. refresh!')
    }
  })
  app.get('/cart', function(req, res, next) {
    if(!req.session.cart){

        req.session.cart = []
    }
    if (req.session.cart) {
      res.setHeader('Content-Type', 'text/html')
      res.write('<p>CART: ')
      res.write('<p>....................................................................................</p>')
      res.write('<span>     Item &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbspOffer Code &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp Price   </span>')
      res.write('<p>....................................................................................</p>')
      
      var offer_item_cart = CheckAndAddOffers.checkAndAddOffers(req.session.cart);
      for (let i=0;i < req.session.cart.length ;i++){
        for(let j=0;j<req.session.cart[i].quantity;j++){
        res.write('<p>'+JSON.stringify(req.session.cart[i].product_code) + '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp $' +JSON.stringify(req.session.cart[i].price)+ '</p>')
        }
        for(let k =0 ; k < offer_item_cart.length;k++){
            if(offer_item_cart[k].product_code === req.session.cart[i].product_code ){
                for(let z=0;z<offer_item_cart[k].quantity;z++){
                    res.write('<p>'+JSON.stringify(offer_item_cart[k].product_code) + '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp'+JSON.stringify(offer_item_cart[k].offer_code)+' &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp $' +JSON.stringify(offer_item_cart[k].price)+ '</p>')
                }
            }
        }
      
    }
      
     // res.write('<p>Offer Item Cart' + JSON.stringify(offer_item_cart) + '</p>')

      //Total amount display
      let init_total = req.session.cart.reduce((total,currElement) => total + currElement.quantity*currElement.price,0)
      let offer_total = offer_item_cart.reduce((total1,currElement1) => total1 + currElement1.quantity*currElement1.price,0)
      let total = init_total + offer_total;
      console.log(offer_total)
      res.write('<p>....................................................................................</p>')
      res.write('<span>     Total &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp  &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp $'+ parseFloat(total) +'</span>')
      res.write('<p>....................................................................................</p>')

      res.end()
    } else {
      req.session.cart = []
      res.end('You have an empty cart!')
    }
  })

app.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});


app.get("/emptycart", async (req, res) => {
    req.session.cart=[];
    res.send({"message": "Cart Emptied"})
})  

app.post('/createProducts', function (req, res, next) {
    console.log("REQ BODY: ",req.body)

    Product.insertMany(req.body, function(err) {
        if(err){
            console.log(err)
            res.send({"message": "Save unsucesfull"})
        }
        else
        {
            res.send({"message": "Save sucesfull"})
        }

    });
    
});

app.get('/addtocart/:product_code', function (req, res, next) {

    if(!req.session.cart){
        console.log("SETTING CART TO ARRAY 11")
        req.session.cart = [];
    }


    var productcode = req.params.product_code;

    Product.findOne({product_code: productcode }, function (err, docs) { 
        if (err){ 
            console.log(err) 
            res.send({"message": "Product Not Found"})
        } 
        else{
            if(docs){
                            
            var {_id,__v, ...restOfItems} = docs._doc; 
            console.log("Result : ", restOfItems); 

            const existingCartItem = req.session.cart.find(
                cartItem => cartItem.product_code === productcode
              );
            if (existingCartItem) {
                
                console.log("Item Exists in cart ",JSON.stringify(req.session.cart))
                 req.session.cart.map(cartItem =>
                  cartItem.product_code === productcode
                    ? { ...cartItem, quantity: cartItem.quantity++}
                    : cartItem
                )
                res.send({"message": "Product "+restOfItems.name+" Updated in Cart. Udpated Cart is: "+JSON.stringify(req.session.cart)})
              }

              else
              {
                req.session.cart.push({...restOfItems, quantity: 1})
                res.send({"message": "Product "+restOfItems.name+" Added to Cart. Updates Cart is: "+JSON.stringify(req.session.cart)})

              }
            }
            else
            {
                res.send({"message": "Pelase check the Product Code. Product Code not found in Product list"})

            }
        
        
            
            
        } 
    }); 
});

app.get('/removefromcart/:product_code', function (req, res, next) {

    if(!req.session.cart){
        console.log("SETTING CART TO ARRAY 22")
        req.session.cart = [];
    }


    var productcode = req.params.product_code;

    Product.findOne({product_code: productcode }, function (err, docs) { 
        if (err){ 
            console.log(err) 
            res.send({"message": "Product Not Found"})
        } 
        else{
            if(docs){
            var {_id,__v, ...restOfItems} = docs._doc 
            console.log("Result : ", restOfItems); 

            const existingCartItem = req.session.cart.find(
                cartItem => cartItem.product_code === productcode
              );

              if (existingCartItem && existingCartItem.quantity === 1) {
                 console.log("Remove Condition Mtached")
                 req.session.cart =req.session.cart.filter(cartItem => cartItem.product_code !== productcode)
                 res.send({"message": "Product "+restOfItems.name+" Removed from Cart. Updated Cart is: "+JSON.stringify(req.session.cart)})

                }
              else if(existingCartItem && existingCartItem.quantity >= 1 ){
                 req.session.cart.map(cartItem =>
                  cartItem.product_code === productcode
                    ? { ...cartItem, quantity: cartItem.quantity-- }
                    : cartItem
                )
                res.send({"message": "Product "+restOfItems.name+" Subtracted from Cart. Udpated Cart is: "+JSON.stringify(req.session.cart)})
              }
              else{
                res.send({"message": "Product "+restOfItems.name+" Not found in cart."})


              }
            }
            else
            {
                res.send({"message": "Pelase check the Product Code. Product Code not found in Product list"})

            }

            
        } 
    }); 
});



app.listen(PORT, function () {
    console.log(`Listening on ${PORT}`);
    connectDb().then(() => {
        console.log("MongoDb connected");
    });
});