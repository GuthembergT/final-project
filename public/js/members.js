const list = document.querySelector('#membersList');
const newPersonForm = document.querySelector('.new');


newPersonForm.addEventListener('submit', addPerson);
list.addEventListener('click', enableEditForm);
list.addEventListener('click', cancelEdit);
list.addEventListener('submit', submitEdit);
list.addEventListener('click', viewMember);
list.addEventListener('click', deleteMember);
console.log(new Date());

function viewMember(e) {
    if(e.target.className === 'openPage') {
        fetch('member', {
            method: 'get',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                name: e.target.innerText
            })
        })
    }
}
function addPerson(e){
    e.preventDefault();

    console.log(newPersonForm.querySelector('#profile').files[0]);
    const form = new FormData();
    const data = {
        name: newPersonForm.querySelector('#name').value,
        nickname: newPersonForm.querySelector('#nickname').value,
        rank: newPersonForm.querySelector('#rank').value,
        membership: newPersonForm.querySelector('#membership').value,
        startDate: newPersonForm.querySelector('#start').value,
        'file-to-upload': newPersonForm.querySelector('#profile').files[0]
    }

    if(data.membership !== 'None') {
        const selectedDay = newPersonForm.querySelector('#start').value;
        const startDate = new Date(`${parseInt(selectedDay.slice(0,4))},${parseInt(selectedDay.slice(5,7))},${parseInt(selectedDay.slice(8,10))}`);
        const endDate = new Date(`${parseInt(selectedDay.slice(0,4))},${parseInt(selectedDay.slice(5,7))},${parseInt(selectedDay.slice(8,10))}`);
        switch(data.membership) {
            case 'Monthly': endDate.setMonth(endDate.getMonth() + 1); break
            case 'Yearly': endDate.setFullYear(endDate.getFullYear() + 1); break;
        }
        data.startDate = startDate;
        data.endDate = endDate;
    }

    // addPersonDOM();

    for(property in data)
        form.set(property, data[property]);

    fetch('members', {
        method:'post',
        body:form
    }).then(() => { window.location.reload(); })


}

function addPersonDOM() {
    //Create li to insert new Capoeirista
    const newPerson = document.createElement('li');
    const editForm = document.createElement('form');
    const editActiveDiv = document.createElement('div');
    const opacityDiv = document.createElement('div');
    const newInfo = document.createElement('section');
    let children = ['rank', 'nickname', 'name', 'membership', 'profile', 'DELETE', 'Edit'];

    newInfo.classList.add('info');
    newPerson.classList.add('person');
    editForm.classList.add('editForm','hide');
    list.appendChild(newPerson);
    newPerson.appendChild(editActiveDiv);
    newPerson.appendChild(editForm);
    editActiveDiv.appendChild(opacityDiv);
    opacityDiv.appendChild(newInfo);

    //Create variable for each element
    //Give each element its appropriate class
    children.forEach((child, i) => {
        let el;
        switch(i) {
            case 0: case 1: el = document.createElement('h2'); break;
            case 2: case 3: el = document.createElement('h3'); break;
            case 4: { 
                el = document.createElement('img');
                el.src = URL.createObjectURL(newPersonForm.querySelector(`#${child}`).files[0]);
        } break;
            case 5:
            case 6: {
                el = document.createElement('button');
                el.innerText = child;
        } break;
        }
        el.classList.add(child.toLowerCase());
        if (i < 4) {
            el.innerText = newPersonForm.querySelector(`#${child}`).value;
            newInfo.appendChild(el)
        }
        else
            opacityDiv.appendChild(el);
    })

    //Create form to edit
    children = ['Name','Nickname','Rank','Profile','Submit', 'Cancel']
    children.forEach((child, i) => {
        let label, input, placeHolder = 'Enter ', innerText = child;
        const div = document.createElement('div');
        switch(i) {
            case 1: placeHolder += 'Capoeira name'; innerText = 'Capoeira Name:'; break;
            case 2: placeHolder += 'rank (Graduado/Monitor/Formado)'; break;
            case 3: placeHolder += 'group name'; innerText = 'Group Name'; break;
            case 5: innerText = 'Group Logo'; break;
            case 6:
                let submit = document.createElement('input');
                submit.setAttribute('type', 'submit');
                submit.classList.add('submit','submitEdit');
                submit.value = child;
                editForm.appendChild(submit);
            break;
            case 7:
                let cancel = document.createElement('button');
                cancel.setAttribute('type', 'button')
                cancel.classList.add(`${child.toLowerCase()}Edit`);
                cancel.innerText = child;
                editForm.appendChild(cancel);
        }
        if (i <= 5) {
            label = document.createElement('label');
            input = document.createElement('input');
            label.htmlFor = child.toLowerCase();
            label.innerText = innerText;
            input.classList.add(child.toLowerCase());
            if (i < 5){
                input.setAttribute('name', `new${child}`);
                input.setAttribute('type', 'text');
                input.placeholder = placeHolder + (i === 0 || i === 4) ? child.toLowerCase() : '';
            }
            else if (i === 5) {
                input.setAttribute('name', 'file-to-upload');        
                input.setAttribute('type', 'file');
            }
            div.appendChild(label);
            div.appendChild(input);
            editForm.appendChild(div);
        }

    })
}


function cancelEdit(e) {
    if (e.target.className === 'cancelEdit') {
        const person = e.target.closest('.person');
        person.querySelector('.editForm').classList.add('hide');
        person.querySelector('.person > div > div').classList.remove('opacity');
        person.querySelector('.person > div').classList.remove('editActive');
        }
}

function enableEditForm(e) {
    if (e.target.className === 'edit') {
        const person = e.target.closest('.person');
        console.log(person);
        person.querySelector('.editForm').classList.remove('hide');
        person.querySelector('.person > div > div').classList.add('opacity');
        person.querySelector('.person > div').classList.add('editActive');
        }
}

function submitEdit(e) {
        e.preventDefault();
        const personEl = e.target.closest('.person');
        const newFirst = personEl.querySelector('.editForm .first').value;
        const newLast = personEl.querySelector('.editForm .last').value;
        const newNickname = personEl.querySelector('.editForm .nickname').value;
        const newRank = personEl.querySelector('.editForm .rank').value;
        const newProfile = personEl.querySelector('.editForm .profile').files[0];
        const oProfile = imageName(personEl.querySelector('.profile').src);
        const oName = personEl.querySelector('.info .name').innerText.split(' ');
        const form = new FormData();
        
        const data = {
            first: oName[0],
            last: oName[1],
            profile: oProfile
        }
        if(personEl.querySelector('.info .nickname').innerText !== "")
            data.nickname = personEl.querySelector('.info .nickname').innerText;
        if(personEl.querySelector('.info .rank').innerText !== "")
            data.rank = personEl.querySelector('.info .rank').innerText;
        if(newFirst !== "")
            data.newFirst = newFirst;
        if(newLast !== "")
            data.newLast = newLast;
        if(newNickname !== "")
            data.newNickname = newNickname;
        if(newRank !== "")
            data.newRank = newRank;
        if(newProfile != undefined)
            data['file-to-upload'] =  newProfile;

            console.log(data);

        for(property in data)
            form.set(property, data[property])

        fetch('members', {
            method:'put',
            body:form
        })
        .then(() => {
            window.location.reload()
        })
}


function imageName(path) {
    return path.slice(path.lastIndexOf('/') + 1);
}
function taskComplete(e) {
    if (e.target.tagName === 'SPAN') {
        fetch('markCompleted', {
            method: 'put',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify({
                task: e.target.innerText,
                completed: e.target.classList.contains('done')
            })
        })
        .then(function (response) {
            window.location.reload()
          })
    }
}

function deleteMember(e) {
    if (e.target.className === 'delete'){
        const info = e.target.closest('.person');
        const name = info.querySelector('.info .name').innerText.split(' ');
        fetch('members', {
        method: 'delete',
        headers: {'Content-Type':'application/json'},
        body:JSON.stringify({
            first: name[0],
            last: name[1],
            nickname: info.querySelector('.info .nickname').innerText,
            rank: info.querySelector('.info .rank').innerText,
            membership: info.querySelector('.info .membership').innerText,
            picture: imageName(info.querySelector('.profile').src)
        })
        })
        .then(function(response) {
            window.location.reload();
        })
    }
}
