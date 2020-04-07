
const mysql = require('mysql');

function connectToDatabase(){

    const connection = mysql.createConnection({
      host     : '176.88.28.92',
      user     : 'root',
      password : 'root*',
      database : 'musicNinja'
    });

    return new Promise((resolve,reject) => {
       connection.connect();
       resolve(connection);
    });

}
