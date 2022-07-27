const body = document.getElementById('body');

const req = new XMLHttpRequest();
req.open('GET', '/publicPolls', true);
req.responseType = 'json';
req.addEventListener('load', () => {
    if (req.status < 400) {
        for (i = 0; i < req.response.length; ++i) {
            let block = document.createElement('div');
            block.id = 'poll' + i;
            block.style.textAlign = 'justify';
            block.style.border = '2px solid black';

            let blockName = document.createElement('h2');
            blockName.id = 'name' + i;
            blockName.innerText = req.response[i].name;
            let blockText = document.createElement('p');
            blockText.id = 'text' + i;
            blockText.innerText = req.response[i].content;
            let blockLink = document.createElement('a');
            blockLink.href = '/polls/' + req.response[i].link;
            blockLink.innerText = 'Перейти';
            block.appendChild(blockName);
            block.appendChild(blockText);
            block.appendChild(blockLink);
            body.appendChild(block);
        }
    }
});
req.send();