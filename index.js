const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const serviceAccount = require('./first-authentication-1d864-firebase-adminsdk-i3jwu-518576da3d.json')
const admin = require("firebase-admin");
const { json } = require("express");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 5000;





//doctors-portal
// mHFg38p3s2kgZwHN
app.use(cors());
app.use(express.json());
require('dotenv').config()

// ----step 2 ---jwt token----------
// async function verifyToken(req,res,next){
// if(req?.Headers?.authorization){
//   const token = req?.headers?.authorization.split(' ')[1];

//   try{
// const decodeduser = await admin.auth().verifyToken(token);
// req.decodedemail = decodeduser.email;


//   }
//   catch{

//   }
// }

//   next()
// }
async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);

      try {
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
      }
      catch {

      }

  }
  next();
}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgoei.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

// databse
client.connect(err => {
    const database = client.db("doctors-portal")
    const appoitmentcollection = database.collection('appoitment')
    const newUser = database.collection('Newuser')
    const admincollection = database.collection('admin')



// -------------post registration user-------------
app.post('/adduser',async(req,res)=>{
  console.log(req.body)
  const result = await  newUser.insertOne(req.body)
  res.send(result)
})
app.get('/getuser/:email',async(req,res)=>{
  const result = await newUser.find({email:req.params.email}).toArray()
  res.send(result)
})
// ---------post appoitment--------------
app.post('/addappoitment', async(req,res)=>{
  const info = req.body
  console.log(info);
  const result = await appoitmentcollection.insertOne(info)
  res.send(result)
})
// ----------------get appoitment------------
app.get('/getappoitment', async(req,res)=>{
  const result = await appoitmentcollection.find({}).toArray()
  res.send(result)
})
// ---------------------------query by email-----------
app.get('/query',async(req,res)=>{
  const email = req.query.email
  const date = req.query.date
  const result = await appoitmentcollection.find({email:email,date:date}).toArray()
  res.send(result)

})

// ----------query for google----------------------

app.put('/adduser', async(req,res)=>{
 
  const filter = {email:req.body.email}
  const options = {upsert:true};
  const updatedoc ={$set: req.body}
  const result = await newUser.updateOne(filter,updatedoc,options)
res.send(result)
})
    // // perform actions on the collection object
    // client.close();
// ------------------------------admin panel setup---------------------

app.put('/adduser/admin', verifyToken, async(req,res)=>{


 const user = req.body
 console.log(user);
 const requester = req.decodedEmail
 console.log(requester);
 if(requester){
   const cheek = await newUser.findOne({email:requester})
   if(cheek.roll ==="admin"){
  const filter = {email:user.email}
 console.log(req.body.email)
   const updatedoc ={$set: {roll:"admin"}}
   const result = await newUser.updateOne(filter,updatedoc)
 res.json(result)

   }
 }
 else{
   res.status(403)
 }


})









  });





app.get('/', (req,res)=>{
    res.send('server connected')
})

app.listen(port,{})