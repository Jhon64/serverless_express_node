var AWS = require('aws-sdk');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const express = require("express");
const serverless = require("serverless-http");


const app = express();

const USERS_TABLE = process.env.USERS_TABLE||'users-table';
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region:'us-east-1'
});

app.use(express.json());

app.get("/users/:userId", async function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const { Items } = await dynamoDB.scan(params).promise();
    if (Items.length) {
      const { userId, name } = Items[0];
      res.json({ userId, name });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive user" });
  }
});

app.post("/users", async function (req, res) {
  const { userId, name } = req.body;
  if (typeof userId !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item:  {
      userId: userId,
      name: name,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.json(params);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.listen(5000,function (port=5000) {
  console.log("iniciando app ",port);
})

module.exports.handler = serverless(app);
