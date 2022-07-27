const form = document.getElementById('form');

let link = document.URL.split('/')[document.URL.split('/').length - 1];
const decoder = new TextDecoder('utf-8');
var poll_id;
const req = new XMLHttpRequest();
const newReq = new XMLHttpRequest();
newReq.responseType = 'json';
req.open('GET', '/getPoll/' + link, true);
req.responseType = 'json';
req.addEventListener('load', () => {
    if (req.status < 400) {
        console.log(req.response);
        let header = document.createElement('h1');
        header.innerText = req.response.pall.name;
        let content = document.createElement('p');
        content.innerText = req.response.pall.content;
        poll_id = req.response.pall.id;

        form.appendChild(header);
        form.appendChild(content);
        for (i = 0; i < req.response.answers.length; ++i) {
            let answer = document.createElement('input');
            answer.type = 'radio';
            answer.name = 'answer_id';
            answer.value = req.response.answers[i].id;
            answer.required = true;
            form.appendChild(answer);
            form.append(req.response.answers[i].content);
            form.append(document.createElement('br'));
        }
        let subm = document.createElement('input');
        subm.innerText = 'Отправить';
        subm.type = 'submit';
        form.append(subm);
    }
});
req.send();

newReq.addEventListener('load', () => {
    console.log(newReq.response);
    if (newReq.response.length > 0) {
        alert("Вы уже отвечали на данный опрос");
    } else {
        form.submit();
    }
});

form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    newReq.open('GET', '/checkAnswer?id=' + poll_id, true);
    newReq.send();
})