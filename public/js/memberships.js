const membershipForm = document.querySelector('#membershipForm');
const showFormBtn = document.querySelector('#showForm');
const submitMembership = document.querySelector('.sbmtMmbrshp');
const limit = document.querySelector('#limit');

showFormBtn.addEventListener('click', showForm);
membershipForm.addEventListener('submit', submitNewMembership);
limit.addEventListener('click', showLimitOptions);
limit.addEventListener('keydown', keyEntryLimitOptions)

function keyEntryLimitOptions(e) {
    if(e.target.id === 'limit' && (e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
        if(limit.value === 'Unlimited') {
            membershipForm.querySelector('#limitNumber').classList.remove('hide');
            membershipForm.querySelector('#occurences').classList.remove('hide');
        }
        else {
            membershipForm.querySelector('#limitNumber').classList.add('hide');
            membershipForm.querySelector('#occurences').classList.add('hide');
        }
    }
}

function showLimitOptions() {
    if(limit.value === 'Limited') {
        membershipForm.querySelector('#limitNumber').classList.remove('hide');
        membershipForm.querySelector('#occurences').classList.remove('hide');
    }
    else {
        membershipForm.querySelector('#limitNumber').classList.add('hide');
        membershipForm.querySelector('#occurences').classList.add('hide');
    }
}
function showForm() {
    if (membershipForm.classList.contains('hide')){
        membershipForm.classList.remove('hide')
        showFormBtn.innerText = 'Cancel';
    }
    else {
        membershipForm.classList.add('hide')
        showFormBtn.innerText = 'Add New Membership Option';
    }
}

function submitNewMembership(e) {
    e.preventDefault();
    const formInfo = e.target;

    var data = {
        name: formInfo.querySelector('#name').value,
        cost: formInfo.querySelector('#cost').value,
        duration: formInfo.querySelector('#duration').value,
        durationUnit: formInfo.querySelector('.duration').value,
        limit: formInfo.querySelector('#limit').value
    }
    if (data.limit === 'Limited'){
        data.limitNumber = formInfo.querySelector('#limitNumber').value;
        data.occurences = formInfo.querySelector('#occurences').value;
    }
    
    fetch('addMembership', {
        method: 'post',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(data)
    }).then(() => { window.location.reload() })
}