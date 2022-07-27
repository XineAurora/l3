const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./polls.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Database connection established');
});


db.run('CREATE TABLE IF NOT EXISTS polls \
        (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            name TEXT NOT NULL,\
            content TEXT NOT NULL,\
            link TEXT UNIQUE,\
            private INTEGER CHECK(private > -1 AND private < 2)\
        );',
    (err) => {
        if (err) console.error(err.message);
        else console.log('Table \"polls\" created');
    });


db.run('CREATE TABLE IF NOT EXISTS answers \
    (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        poll_id INTEGER,\
        content TEXT NOT NULL,\
        FOREIGN KEY (poll_id) REFERENCES polls (id) ON DELETE CASCADE ON UPDATE CASCADE\
    );',
    (err) => {
        if (err) console.error(err.message);
        else console.log('Table \"answers\" created');
    });


db.run('CREATE TABLE IF NOT EXISTS chosen_answers \
        (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            poll_id INTEGER,\
            answer_id INTEGER,\
            ip TEXT NOT NULL,\
            ans_date TEXT,\
            FOREIGN KEY (poll_id) REFERENCES polls (id) ON DELETE CASCADE ON UPDATE CASCADE\
            FOREIGN KEY (answer_id) REFERENCES answers (id) ON DELETE CASCADE ON UPDATE CASCADE\
        );',
    (err) => {
        if (err) console.error(err.message);
        else console.log('Table \"chosen_answers\" created');
    });


db.close((err) => {
    if (err) console.error(err.message);
});