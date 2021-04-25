const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
const path = require('path');
const hbs = require('hbs');
const { MongoClient } = require('mongodb');
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({
//     extended:true
// }))
// app.use(bodyParser.json());
// app.use(express.bodyParser());
const mongoose = require('mongoose');
mongoose.set('useFindAndModify',false);
const url = 'mongodb://localhost/fashion';
mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true});
const con = mongoose.connection;
con.on('open',()=>{
    console.log('DataBase Fashion Connected Sucessfully!!');
})
//console.log(__dirname);
app.use(express.static(path.join(__dirname,'../public')));
// console.log(path.join(__dirname, '/templates/partials'));
// console.log(path.join(__dirname,'../public'));
const viewPath = path.join(__dirname,'../templates/views')
const partialsPath = path.join(__dirname,'../templates/partials');
hbs.registerPartials(partialsPath);
app.set('views',viewPath);
app.set('view engine', 'hbs');
app.get('/',async (req,res) => {
    //res.send('Starting Page');
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
    const data = await client.db("fashion").collection("products").find({}).toArray((error,data) => {
        if(error){
            console.log(error);
        }
        else{
            //console.log(data);
            // data.forEach((product)=>{
            //     console.log(product.product_id);
            // })
            res.render('index',
                {
                    products:data
                }
            )
        }
    })
    //res.render('index');
})
app.get('/add-product',(req,res)=>{
    //res.send('Adding Product');
    res.render('addProduct');
})
app.post('/add_product',async (req,res)=>{
    console.log(req.body);
    console.log(req.body.Size);
    console.log(req.body.Product_Id);
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
    const data = await client.db("fashion").collection("products").insertOne({
        product_id: req.body.Product_Id,
        brand: req.body.Brand,
        category:req.body.Category,
        product_name: req.body.Product_Name,
        size: req.body.Size,
        quantity: req.body.Quantity,
        cost_price: req.body.Cost_Price,
        selling_price: req.body.Selling_Price
    })
    res.render('success_add_product',{type:"Product",operation:"Added"});
})
app.get('/fashion-feet',(req,res)=>{
    res.redirect('/');
})
app.get('/edit/:id',async (req,res)=>{
    console.log(req.params.id);
    const client = new MongoClient(url,{useUnifiedTopology:true});;
    await client.connect();
    const data = await client.db("fashion").collection("products").findOne({product_id: req.params.id})
    console.log(data);
    res.render('editProduct',
            {
                id: req.params.id,
                brand:data.brand,
                category:data.category,
                name:data.product_name,
                quantity:data.quantity,
                cp:data.cost_price,
                sp:data.selling_price
            }
    );
    console.log(data);
})
app.post('/edit/edit_product',async (req,res)=>{
    console.log(req.body);
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
    const data = await client.db("fashion").collection("products").findOneAndUpdate(
        {"product_id":req.body.Product_Id},
        {
            $set: {"quantity":req.body.n_stock,"cost_price":req.body.N_Cost_Price,"selling_price":req.body.N_Selling_Price}
        }
    )
    res.render('success_add_product',{type:"Product",operation:"Edited"});
})
app.get('/delete/:id',async (req,res)=>{
    //res.send('Delete');
    //console.log(req.params.id);
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
    await client.db("fashion").collection("products").findOneAndDelete({"product_id":req.params.id},(error,data)=>{
        if(error){
            console.log(error);
        }
        else{
            console.log(data);
        }
    })
    res.render('success_add_product',{ type: 'Product',operation:"Deleted"});
})
app.get('/home',(req, res)=>{
    res.redirect('/');
})
app.get('/sales_details',async (req, res)=>{
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
     await client.db("fashion").collection("sales").find({}).toArray((error,data)=>{
         if(error){
             console.log(error);
             res.send('Error Occured');
         }
         else{
             //console.log(data);
             res.render('sales_index',{sales:data});
         }
     })
})
app.get('/sales/edit/:id',async (req, res)=>{
    //console.log(req.params.id);
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
    await client.db("fashion").collection("sales").findOne({"product_id":req.params.id},(error,data)=>{
        if(error) {
            console.log(error);
            res.send('Error in Updating Sales..');
        }
        else{
            //console.log(data);
            res.render('editFormSales',
                 {
                     date:data.purchase_date,
                     id:data.product_id,
                     price:data.unit_price,
                     O_quantity:data.quantity,
                     sales:data.total_sales
                 }
            )
        }
    })
})
app.post('/sales/edit/edit_sales',async (req, res)=>{
    console.log(req.body);
    const new_sales = Number(req.body.new_quantity)*Number(req.body.unit_price);
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
    await client.db("fashion").collection("sales").findOneAndUpdate({"product_id":req.body.product_id},
                     {
                         $set: {"quantity":req.body.new_quantity,"total_sales":new_sales}
                     }
    )
    res.render('success_add_product',
          {
              type:"Sales",
              operation:"Updated"
          }
    )
})
app.get('/sales/delete/:id',async (req, res)=>{
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
    await client.db("fashion").collection("sales").findOneAndDelete({"product_id":req.params.id},(error,data)=>{
        if(error){
            res.send(error);
        }
        else{
            res.render('success_add_product',
                   {
                       type:"Sales",
                       operation:"Deleted"
                   }
            )
        }
    })
})
app.get('/update_sales',(req,res)=>{
    res.render('editNewSales')
})
app.post('/edit_sales', async (req,res)=>{
    const client = new MongoClient(url,{useUnifiedTopology:true});
    await client.connect();
    await client.db("fashion").collection("sales").insertOne(
        {
         "purchase_date":req.body.purchase_date,
         "product_id":req.body.product_id,
         "unit_price":req.body.unit_price,
         "quantity":req.body.new_quantity,
         "total_sales":Number(req.body.unit_price)*Number(req.body.new_quantity)   
        }
    ,(error,data)=>{
        if(error){
            res.send(error);
        }
        else{
            res.render('success_add_product',
                  {
                      type:" New Sales",
                      operation:"Added"
                  }
            )
        }
    })
})
app.get('*',(req, res)=>{
    res.render('404');
})
app.listen(7000,()=>{
    console.log('Server Started and listening on Port 5000...');
})