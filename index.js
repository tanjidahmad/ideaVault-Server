


const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");

const cors = require("cors");

require("dotenv").config();

const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const app = express();

const PORT = process.env.PORT || 8000;




app.use(cors());

app.use(express.json());




const uri = process.env.MONGODB_URL;




const client = new MongoClient(uri, {

  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },

});


const JWKS =createRemoteJWKSet(

  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)






const verifyToken = async (
  req,
  res,
  next
) => {

  const authHeader= req?.headers.authorization
  if(!authHeader){
    return res.status(401).json({message: 'Unauthorized'})
  }
  const token= authHeader.split(" ")[1]
  console.log(token)
  if(!token){
return res.status(401).json({message: 'Unauthorized'})

  }
try{
const {payload} = await jwtVerify(token,JWKS)
console.log(payload)
 next();
}catch(error){
 return res.status(403).json({message: 'Unauthorized'})
}

  

};



async function run() {

  try {

   



 
    const db =
      client.db("ideaVaultDB");



   
    const ideasCollection =
      db.collection("ideas");

    const commentsCollection =
      db.collection("comments");




    app.get("/", (req, res) => {

      res.send(
        "IdeaVault Server Running"
      );

    });



   
    app.get("/ideas",async (req, res) => {

      const search =
        req.query.search || "";

      const category =
        req.query.category || "";

      let query = {};



     
      if (search) {

        query.title = {
          $regex: search,
          $options: "i",
        };

      }



      if (category) {

        query.category = category;

      }



      const result =
        await ideasCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

      res.send(result);

    });



    app.get(
      "/trending-ideas",
      async (req, res) => {

        const result =
          await ideasCollection
            .find()
            .sort({ createdAt: -1 })
            .limit(6)
            .toArray();

        res.send(result);

      }
    );



    app.get(
       "/ideas/:id",verifyToken,





      // },
      async (req, res) => {

        const { id } = req.params;

        const result =
          await ideasCollection.findOne({
            _id: new ObjectId(id),
          });

        res.send(result);

      }
    );



    app.post(
      "/ideas",
       verifyToken,
      async (req, res) => {

        const ideaData = req.body;

        ideaData.createdAt = new Date();

        const result =
          await ideasCollection.insertOne(
            ideaData
          );

        res.send(result);

      }
    );



  
    app.patch(
      "/ideas/:id",
     
      async (req, res) => {

        const { id } = req.params;

        const updateData = req.body;

        const result =
          await ideasCollection.updateOne(
            {
              _id: new ObjectId(id),
            },
            {
              $set: updateData,
            }
          );

        res.send(result);

      }
    );



    app.delete(
      "/ideas/:id",
      
      async (req, res) => {

        const { id } = req.params;

        const result =
          await ideasCollection.deleteOne({
            _id: new ObjectId(id),
          });

        res.send(result);

      }
    );



    app.get(
      "/my-ideas/:email",
       verifyToken,
      async (req, res) => {

        const { email } = req.params;

        const result =
          await ideasCollection
            .find({
              userEmail: email,
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.send(result);

      }
    );



    app.post(
      "/comments",
      // verifyToken,
      async (req, res) => {

        const commentData = req.body;

        commentData.createdAt = new Date();

        const result =
          await commentsCollection.insertOne(
            commentData
          );

        res.send(result);

      }
    );



    app.get(
      "/comments/:ideaId",verifyToken,
      async (req, res) => {

        const { ideaId } = req.params;

        const result =
          await commentsCollection
            .find({ ideaId })
            .sort({ createdAt: -1 })
            .toArray();

        res.send(result);

      }
    );



    app.patch(
      "/comments/:id",
        verifyToken,
      async (req, res) => {

        const { id } = req.params;

        const updateData = req.body;

        const result =
          await commentsCollection.updateOne(
            {
              _id: new ObjectId(id),
            },
            {
              $set: updateData,
            }
          );

        res.send(result);

      }
    );



    app.delete(
      "/comments/:id",
        verifyToken,
      async (req, res) => {

        const { id } = req.params;

        const result =
          await commentsCollection.deleteOne({
            _id: new ObjectId(id),
          });

        res.send(result);

      }
    );



    app.get(
      "/my-interactions/:email",
       verifyToken,
      async (req, res) => {

        const { email } = req.params;

        const result =
          await commentsCollection
            .find({
              userEmail: email,
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.send(result);

      }
    );



    // await client
    //   .db("admin")
    //   .command({ ping: 1 });

    console.log(
      "MongoDB Connected Successfully"
    );

  } finally {

  }
}

run().catch(console.dir);




app.listen(PORT, () => {

  console.log(
    `Server Running On Port ${PORT}`
  );

});