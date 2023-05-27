/** Database connection for messagely. */


const { Client } = require("pg");
const { dbName } = require("./config");

const client = new Client({
    host: "/var/run/postgresql/",
    database: dbName, 
});

const connectToDatabase = async () => {
    await client.connect();
}

connectToDatabase()

module.exports = client;
