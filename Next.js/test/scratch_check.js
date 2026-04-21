const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:Since2020%40%23@localhost:5432/postgres?schema=test'
});
client.connect().then(() => {
  return client.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema IN ('public', 'test')");
}).then(res => {
  console.log(res.rows);
  client.end();
}).catch(console.error);
