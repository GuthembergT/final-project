var thumbs = document.getElementsByClassName("thumbs");
var trash = document.getElementsByClassName("fa-trash-o");

Array.from(thumbs).forEach(function(element) {
      element.addEventListener('click', function(e){
        const li = this.closest('.post');
        const name = li.querySelector('.post > p').innerText;
        const src = li.querySelector('.post > img').getAttribute("src")
        const up = parseFloat(li.querySelector('.tUp').innerText);
        const down = parseFloat(li.querySelector('.tDown').innerText);
        if(e.target.classList.contains("fa-thumbs-up")){
             fetch('messages', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                 'name': name,
                 'src': src,
                 'thumbsUp': up
                  })
             })
             .then(response => {
               if (response.ok) return response.json()
             })
             .then(function() {
               window.location.reload()
             })
      }else if (e.target.classList.contains("fa-thumbs-down")){
            fetch('messages', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  'name': name,
                  'src': src,
                  'thumbsDown': down
                  })
            })
            .then(response => {
              if (response.ok) return response.json()
            })
            .then(function() {
              window.location.reload()
            })
      }

      });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        // const msg = this.parentNode.parentNode.childNodes[5].innerText
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            // 'msg': msg
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

























// var thumbUp = document.getElementsByClassName("fa-thumbs-up");
// var trash = document.getElementsByClassName("fa-trash");

// Array.from(thumbUp).forEach(function(element) {
//       element.addEventListener('click', function(){
//         const name = this.parentNode.parentNode.childNodes[1].innerText
//         const msg = this.parentNode.parentNode.childNodes[3].innerText
//         const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
//         fetch('messages', {
//           method: 'put',
//           headers: {'Content-Type': 'application/json'},
//           body: JSON.stringify({
//             'name': name,
//             'msg': msg,
//             'thumbUp':thumbUp
//           })
//         })
//         .then(response => {
//           if (response.ok) return response.json()
//         })
//         .then(data => {
//           console.log(data)
//           window.location.reload(true)
//         })
//       });
// });

// Array.from(trash).forEach(function(element) {
//       element.addEventListener('click', function(){
//         const name = this.parentNode.parentNode.childNodes[1].innerText
//         const msg = this.parentNode.parentNode.childNodes[3].innerText
//         fetch('messages', {
//           method: 'delete',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             'name': name,
//             'msg': msg
//           })
//         }).then(function (response) {
//           window.location.reload()
//         })
//       });
// });
