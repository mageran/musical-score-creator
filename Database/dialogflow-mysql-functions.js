
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

function insertIntoMusicToDatabase(connection, musicName){
	return new Promise((resolve, reject) => {
		connection.query('INSERT INTO musicTable(name,signup_date) VALUES ('+"'"+musicName+"'"+',NULL);', (error, results, fields) => {
			resolve(results);
		});
    	});
}


function deleteMusicFromDatabase(connection, musicName){
    return new Promise((resolve, reject) => {
      connection.query('DELETE from musicTable WHERE name = ?', musicName, (error, results, fields) => {
        resolve(results);
      });
    });
}
