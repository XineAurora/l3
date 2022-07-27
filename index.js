const http = require('http');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./polls.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Database connection established');
});

const SqlRequestPublicPolls = "SELECT name, content, link FROM polls WHERE private = 0;";
const SqlRequestPoll = "SELECT id, name, content FROM polls WHERE link = ?;";
const SqlRequestPollAnswers = "SELECT id, content FROM answers WHERE poll_id = ?;";
const SqlRequestPollId = "SELECT poll_id FROM answers WHERE id = ?;";
const SqlRequestCheckAnswer = "SELECT answer_id FROM chosen_answers WHERE (poll_id = ? AND ip = ?)";
const SqlInsertSelectedAnswer = "INSERT INTO chosen_answers (poll_id, answer_id, ip, ans_date)  VALUES(?, ?, ?, ?)";
const SqlRequestAnswerCount = "SELECT answer_id, count(*) AS answer_count, content\
                                FROM chosen_answers INNER JOIN answers\
                                	ON (chosen_answers.answer_id = answers.id)\
                                WHERE chosen_answers.poll_id = ?\
                                GROUP BY answer_id\
                                ORDER BY answer_count DESC;";
const SqlInsertPoll = "INSERT INTO polls (name, content, private) VALUES(?, ?, ?);";
const SqlUpdatePoll = "UPDATE polls SET link = ? WHERE id = ?;";
const SqlInsertAnswer = "INSERT INTO answers (poll_id, content)"

var currentLink;

const server = http.createServer((req, res) => {

    switch (req.url) {
        case '/':
        case '/polls':
        case '/polls/':
            loadPollsList(req, res);
            break;

        case '/publicPolls':
            returnPublicPolls(req, res);
            break;

        case '/postAnswer':
            putAnswer(req, res);
            break;

        case '/postNewPoll':
            putNewPoll(req, res);
            break;

        case '/createNewPoll':
            loadPollCreator(req, res);
            break;

        default:
            console.log(req.url);
            if (req.url.endsWith('.js')) {
                loadScript(req, res);
            }
            else if (req.url.includes('/polls/')) {
                if (!req.url.endsWith('/result')) {
                    loadPoll(req, res);
                } else {
                    loadPollResult(req, res);
                }
            }
            else if (req.url.startsWith('/getPoll/')) {
                returnPoll(req, res);
            } else if (req.url.startsWith('/getPollResult/')) {
                returnPollResult(req, res);
            }
            else if (req.url.startsWith("/checkAnswer")) {
                checkAnswer(req, res);
            }
    }
});

server.listen(3000, 'localhost', (error) => {
    if (error != null) {
        console.error(error);
    }
});


function loadPoll(req, res) {
    currentLink = req.url.split('/')[req.url.split('/').length - 1];
    fs.readFile('pages/pollPrototype.html', (error, data) => {
        if (error) {
            res.writeHead(500);
            console.error(error);
        } else {
            res.writeHead(200);
            res.write(data);
        }
        res.end();
    });
}

function loadScript(req, res) {
    res.setHeader('Content-Type', 'text/javascript');
    let script = req.url.split('/')[req.url.split('/').length - 1];
    fs.readFile('pages/' + script, (error, data) => {
        if (error) {
            res.writeHead(500);
            console.error(error);
        } else {
            res.writeHead(200);
            res.write(data);
        }
        res.end();
    });
}

function loadPollsList(req, res) {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('pages/home.html', (error, data) => {
        if (error) {
            res.writeHead(500);
            console.error(error);
        } else {
            res.writeHead(200);
            res.write(data);
        }
        res.end()
    });
}

function returnPublicPolls(req, res) {
    db.all(SqlRequestPublicPolls, (err, rows) => {
        if (err) {
            res.writeHead(500);
            console.log(err.message);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.write(JSON.stringify(rows));
        }
        res.end();
    });
}

function returnPoll(req, res) {
    db.all(SqlRequestPoll, [currentLink], (err, rows) => {
        if (err) {
            res.writeHead(500);
            console.log(err.message);
            res.end();
        } else {
            let pall = rows[0];
            db.all(SqlRequestPollAnswers, [pall.id], (err, answers) => {
                if (err) {
                    res.writeHead(500);
                    console.log(err.message);
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    res.write(JSON.stringify({ pall, answers }));
                }
                res.end();
            });
        }
    });
}

function checkAnswer(req, res) {
    let poll_id = parseInt(req.url.split('=')[1]);
    let ip = req.socket.remoteAddress;
    db.all(SqlRequestCheckAnswer, [poll_id, ip], (err, answers) => {
        if (err) {
            res.writeHead(500);
            console.log(err);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.write(JSON.stringify(answers));
        }
        res.end();
    });
}

function putAnswer(req, res) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
        let answer_id = parseInt(chunks.toString().split('=')[1]);
        let ip = req.socket.remoteAddress;
        db.all(SqlRequestPollId, [answer_id], (err, polls) => {
            if (err) {
                res.writeHead(500);
                console.log(err);
                res.end();
            } else {

                let date = new Date();
                let date_str = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay();
                db.all(SqlInsertSelectedAnswer, [polls[0].poll_id, answer_id, ip, date_str],
                    (err) => {
                        if (err) {
                            res.writeHead(500);
                            console.log(err);
                        } else {
                            res.writeHead(301, { Location: '/polls/' + currentLink + "/result" });
                        }
                        res.end();
                    });
            }
        });
    });
}

function loadPollResult(req, res) {
    currentLink = req.url.split('/')[req.url.split('/').length - 2];
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('pages/pollResult.html', (error, data) => {
        if (error) {
            res.writeHead(500);
            console.error(error);
        } else {
            res.writeHead(200);
            res.write(data);
        }
        res.end();
    });
}

function returnPollResult(req, res) {
    currentLink = req.url.split('/')[req.url.split('/').length - 1];
    db.all(SqlRequestPoll, [currentLink], (err, poll) => {
        if (err) {
            res.writeHead(500);
            console.log(err);
            res.end();
        } else {
            db.all(SqlRequestAnswerCount, [poll[0].id], (err, counts) => {
                if (err) {
                    res.writeHead(500);
                    console.log(err);
                    res.end();
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    res.write(JSON.stringify(counts));
                    res.end();
                }
            });
        }
    });
}

function loadPollCreator(req, res) {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('pages/pollCreator.html', (error, data) => {
        if (error) {
            res.writeHead(500);
            console.error(error);
        } else {
            res.writeHead(200);
            res.write(data);
        }
        res.end();
    });
}

function putNewPoll(req, res) {
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        body = body.split('&');
        let data = new Object();
        for (i = 0; i < body.length; ++i) {
            data[body[i].split('=')[0]] = body[i].split('=')[1];
        }
        console.log(data);
        let private = 0;
        if (Object.keys(data).includes("private")) private = 1;
        db.all(SqlInsertPoll, [data.poll_name, data.poll_content, private], (err) => {
            if (err) {
                res.writeHead(500);
                console.log(err);
                res.end();
            } else {
                db.all("SELECT last_insert_rowid();", (err, id_obj) => {
                    if (err) {
                        res.writeHead(500);
                        console.log(err);
                        res.end();
                    } else {
                        let id = id_obj[0]['last_insert_rowid()'];
                        db.all(SqlUpdatePoll, [id.toString(36), id], (err) => {
                            if (err) {
                                res.writeHead(500);
                                console.log(err);
                                res.end();
                            } else {
                                let values_str = SqlInsertAnswer + ' VALUES';
                                let variables = [];
                                let f = false;
                                // let value_placeholder = ;
                                Object.keys(data).forEach(key => {
                                    if (key.includes('answer')) {
                                        if (f) values_str += ',';
                                        else f = true;
                                        values_str += " (?, ?)";
                                        variables.push(id);
                                        variables.push(data[key]);
                                    }
                                });
                                db.all(values_str , variables, (err) => {
                                    if (err) {
                                        res.writeHead(500);
                                        console.log(err);
                                        res.end();
                                    }
                                    else {
                                        res.writeHead(301, { Location: '/polls/' + id.toString(36) });
                                        res.end();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}