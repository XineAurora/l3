const form = document.getElementById('form');

var answer_list = [];
var div_list = [];
var button_list = [];

form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (answer_list.length < 2) {
        alert("Необходимо минимум два варианта ответа");
    } else {
        form.submit();
    }
});

function createAnswer() {
    let div = document.createElement('div');
    let ans = document.createElement('input');
    ans.type = 'text';
    ans.required = true;
    ans.name = 'answer' + answer_list.length;
    ans.value = "";
    let delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.id = answer_list.length;
    delBtn.innerText = 'x';
    delBtn.onclick = (ev) => {
        let n = parseInt(delBtn.id)
        answer_list[n].remove();
        answer_list.splice(n, 1);
        button_list[n].remove();
        button_list.splice(n, 1);
        div_list[n].remove();
        div_list.splice(n, 1);
        for (i = 0; i < button_list.length; ++i) {
            button_list[i].id = i;
            answer_list[i].name = 'answer' + i;
        }
    }
    answer_list.push(ans);
    div_list.push(div);
    button_list.push(delBtn);
    div.append(ans);
    div.append(delBtn);
    form.append(div);
}