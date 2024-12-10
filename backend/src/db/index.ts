import { Database } from "bun:sqlite";

const db = new Database("db.sqlite");

const schema = await Bun.file("src/db/schema.sql").text();
db.exec(schema);

export default db;
