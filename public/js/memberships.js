const membershipForm = document.querySelector('#membershipForm');
const memberships = document.querySelector('.memberships');
// const submitMembership = document.querySelector('.sbmtMmbrshp');
const limit = document.querySelector('#limit');
const modalSelector = document.querySelector('.mpmEdit');

//Clear form at pageload
membershipForm.querySelector('#name').value = '';
membershipForm.querySelector('#cost').value = '';
membershipForm.querySelector('#duration').value = 'day';
membershipForm.querySelector('.duration').value = 'Unlimited';
membershipForm.querySelector('#limitNumber').value = '';
//

document.addEventListener('click', (e) => {console.log(e.target);})


membershipForm.addEventListener('submit', submitNewMembership);

document.addEventListener('click', submitEditForm);

memberships.addEventListener('click', populateWithOriginals);

document.addEventListener('click', showDynamicLimitOptions);
document.addEventListener('keydown', keyEntryDynamicLimitOptions);
limit.addEventListener('click', showLimitOptions);
limit.addEventListener('keydown', keyEntryLimitOptions);

let originalName,
    originalCost,
    originalDuration,
    originalDurationUnit;

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

function populateWithOriginals(e) {
    if(e.target.classList.contains('editBtn')) {
        const selectedMembership = e.target.closest('.originalInfo');
        const modal = document.querySelector('.mpmEdit'),
              formName = selectedMembership.querySelector('.membershipName').innerText,
              formCost = selectedMembership.querySelector('.membershipCost').innerText.slice(0, selectedMembership.querySelector('.membershipCost').innerText.lastIndexOf('.')),
              formDuration = selectedMembership.querySelector('.membershipDuration').innerText,
              formDurationUnit = selectedMembership.querySelector('.membershipDurationUnit').innerText,
              formLimit = selectedMembership.querySelector('.membershipLimit').innerText,
              formLimitNumber = selectedMembership.querySelector('.membershipLimitNumber').innerText,
              formOccurences = selectedMembership.querySelector('.membershipOccurences').innerText;
              
        modal.querySelector('.name').value = formName
        modal.querySelector('.cost').value = formCost
        modal.querySelector('.duration').value = formDuration
        modal.querySelector('.durationUnit').value = formDurationUnit
        modal.querySelector('.limit').value = formLimit
        if (formLimit === 'Limited'){
            modal.querySelector('.limitNumber').value = formLimitNumber
            modal.querySelector('.occurences').value = formOccurences
        }
    }
}

function showDynamicLimitOptions(e) {
    console.log(e.target);
    if (e.target.className === 'limit') {
        const l = e.target;
        const form = e.target.closest('.editMembership');
        console.log(l.value)
        if(l.value === 'Limited') {
            form.querySelector('.limitNumber').classList.remove('hide');
            form.querySelector('.occurences').classList.remove('hide');
        }
        else {
            form.querySelector('.limitNumber').classList.add('hide');
            form.querySelector('.occurences').classList.add('hide');
        }
    }
}

function keyEntryDynamicLimitOptions(e) {
    if(e.target.className === 'limit' && (e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
        const form = e.target.closest('.editMembership');
        if(e.target.value === 'Unlimited') {
            form.querySelector('.limitNumber').classList.remove('hide');
            form.querySelector('.occurences').classList.remove('hide');
        }
        else {
            form.querySelector('.limitNumber').classList.add('hide');
            form.querySelector('.occurences').classList.add('hide');
        }
    }
}

function submitEditForm(e) {
    if(e.target.classList.contains('sbmtEdit')) {
        const membership = e.target.closest('.editMembership');
        const data = {
            name: membership.querySelector('.name').value,
            cost: membership.querySelector('.cost').value,
            duration: membership.querySelector('.duration').value,
            durationUnit: membership.querySelector('.durationUnit').value
        }
        if(membership.querySelector('.limit').value === 'Limited'){
            data.limitNumber = membership.querySelector('.limitNumber').value;
            data.occurences = membership.querySelector('.occurences').value;
        }

        console.log(data);
        fetch('editMembership', {
            method: 'put', 
            headers: { 'Content-Type' : 'applcation/json' },
            body: JSON.stringify(data)
        })
    }
}