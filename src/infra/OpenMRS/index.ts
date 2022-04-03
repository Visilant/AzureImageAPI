import mysql from 'mysql';
let db: any;

export = () => {
    if (!db) {
        db = mysql.createConnection({
            "host": process.env.DATABASE_SERVER,
            "user": process.env.DATABASE_USERNAME,
            "password": process.env.DATABASE_PASSWORD,
            "database": process.env.OPENMRS_DB
        });

        db.connect((err: any) => {
            if (!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        });
    }
    return db;
}