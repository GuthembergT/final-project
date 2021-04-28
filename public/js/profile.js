const original = {};
const profileInfo = document.querySelector('.profileInfo');
document.querySelector('#submitChanges').addEventListener('click', submitEdit);
profileInfo.addEventListener('click', changeRole);

profileInfo.querySelectorAll('span').forEach(field => original[field.className] = field.innerText);
document.querySelector('#editForm').querySelectorAll('input').forEach(input => {
    console.log(input);
    switch(input.id) {
        case 'first':     input.value = original[input.id]; break;
        case 'last':      input.value = original[input.id]; break;
        case 'nickname':  input.value = original[input.id]; break;
        case 'rank':      input.value = original[input.id]; break;
        case 'email':     input.value = original[input.id]; break;
        case 'address':   input.value = original[input.id]; break;
        case 'telephone': input.value = original[input.id]; break;
    } 
})

function submitEdit(e) {
    e.preventDefault();
    const data = {};
    document.querySelector('#editForm').querySelectorAll('input').forEach(field => data[field.id] = field.value);
    fetch('editProfile', {
        method: 'PUT',
        headers: {'Content-Type' : 'application/json'},
        body:JSON.stringify(data)
    }).then(() => { window.location.reload() }).catch(err => console.log(err));
}

function displayRoleChange(e) {
    if (e.target.id === 'roleChange')
        this.querySelector('.roleSection').classList.remove('hide');
    else if(e.target.className === 'cancel')
        this.querySelector('.roleSection').classList.add('hide');
}

function changeRole(e) {
    if (e.target.id === 'roleChange')
        fetch('role', {
            method: 'PUT',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({role: (e.target.querySelector('#role').innerText).toLowerCase() })
        }).then(() => { window.location.reload() })
}