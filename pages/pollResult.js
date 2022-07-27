let link = document.URL.split('/')[document.URL.split('/').length - 2];

var poll_id;

const body = document.getElementById("body");
const req = new XMLHttpRequest();
req.open('GET', '/getPoll/' + link, true);
req.responseType = 'json';
req.addEventListener('load', () => {
    if (req.status < 400) {
        let header = document.createElement('h1');
        header.innerText = req.response.pall.name;
        let content = document.createElement('p');
        content.innerText = req.response.pall.content;
        poll_id = req.response.pall.id;

        body.append(header);
        body.append(content);
    }
});
req.send();

const ansCountReq = new XMLHttpRequest();
ansCountReq.responseType = 'json';
ansCountReq.open('GET', '/getPollResult/' + link, true);
ansCountReq.addEventListener('load', () => {
    if (ansCountReq.status < 400) {
        let count = ansCountReq.response;
        let sum = 0;
        for (i = 0; i < count.length; ++i) {
            sum += count[i].answer_count;
        }
        let block = document.createElement('p');
        block.innerText = "Всего голосов: " + sum;
        body.append(block);
        for (i = 0; i < count.length; ++i) {
            let block = document.createElement('p');
            block.innerText = count[i].content + ' ' + (count[i].answer_count * 100.0 / sum).toFixed(2) + '%';
            body.append(block);
        }
    }
});
ansCountReq.send();