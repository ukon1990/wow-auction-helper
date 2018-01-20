var AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-1",
  endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

var params = {
  TableName: "recipes",
  KeySchema: [
    { AttributeName: "spellID", KeyType: "HASH" },  //Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: "spellID", AttributeType: "N" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

dynamodb.listTables({})
  .promise()
  .then((data) => {
    const exists = data.TableNames
      .filter(name => {
        return name === tableName;
      })
      .length > 0;
    if (exists) {
      return Promise.resolve();
    }
    else {
      const params = {
        TableName: tableName,
        // more params
      };
      return dynamodb.createTable(params).promise();
    }
  });
