const schedule = document.querySelector('.schedule'),
      day = document.querySelector('.day');

document.querySelector('.more').addEventListener('click', addDay);
document.querySelector('#submitLocation').addEventListener('click', submitLocation);
schedule.addEventListener('click', reservationEnabled);

function reservationEnabled(e) {
    if (e.target.className === 'enableReservation') {
        if (e.target.checked)
            e.target.closest('.reserve').querySelector('.reserveLimit').classList.remove('hide');
        else
            e.target.closest('.reserve').querySelector('.reserveLimit').classList.add('hide');
    }
}
function addDay() {
    const newDay = document.createElement('div');
    newDay.innerHTML = day.innerHTML;
    newDay.className = 'day';
    schedule.appendChild(newDay);
}

function submitLocation(e) {
    e.preventDefault();
    const form = e.target.closest('form');
    let scheduleList = [];
    schedule.querySelectorAll('.day').forEach(el => {scheduleList.push(getDayInfo(el))});
    console.log(scheduleList);
    const data = {
        name: form.querySelector('#name').value,
        location: form.querySelector('.location').value,
        schedule: scheduleList
    }
    fetch('newClass', {
        method: 'post',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(data)
    }).then(() => { window.location.href = '/classes' });
}

function getDayInfo(dayEl) {
    const packaged = {
        day: dayEl.querySelector('.weekday').value,
        start: `${dayEl.querySelector('.start > .hour').value}:${dayEl.querySelector('.start > .minute').value} ${dayEl.querySelector('.start > .amOrPM').value}`,
        duration: `${dayEl.querySelector('.duration > .hour').value} hour${dayEl.querySelector('.duration > .hour').value > 1 ? 's' : ''} and ${dayEl.querySelector('.duration > .minute').value} minute${dayEl.querySelector('.duration > .minute').value > 1 ? 's' : ''}`
    }

    if(reserveTrue(dayEl)) {
        packaged.reservation = true;
        packaged.reserveLimit = dayEl.querySelector('.reservationMax').value;
    }
    return packaged;
}

function reserveTrue(day) {
    return (day.querySelector('.enableReservation').checked)
}