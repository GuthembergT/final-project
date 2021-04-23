document.querySelector('#edit').addEventListener('click', showEditForm);
document.querySelector('#cancel').addEventListener('click', cancelEdit);

function showEditForm() {
    this.classList.add('hide');
    document.querySelector('#newLocation').classList.remove('hide');
}

function cancelEdit() {
    this.closest('#newLocation').classList.add('hide')
    document.querySelector('#edit').classList.remove('hide');
}