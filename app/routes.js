module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // MEMBERS SECTION =========================
    app.get('/members', isLoggedIn, function(req, response) {
        db.collection('members').find().toArray((err, result) => {
          db.collection('memberships').find().toArray((error, res) => {
            if (error) return console.log(error);
            response.render('members.ejs', {
              user : req.user,
              members: result,
              membership: res
            })
          })
          if (err) return console.log(err)
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

app.post('/members', (req, res) => {
  db.collection('members').save({
    name: req.body.name, 
    nickname:req.body.nickname, 
    membership:req.body.membership, 
    rank:req.body.rank, 
    profile: "img/" + req.file.filename
  }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/members')
  })
})

app.put('/members', (req, res) => {
    db.collection('posts')
    .findOneAndUpdate({
      name: req.body.name, 
      nickname:req.body.nickname, 
      membership:req.body.membership, 
      rank:req.body.rank, 
      profile: "img/" + req.file.filename
    },
    {
      $set: {
        name: ((req.body.newName === '') ? req.body.name : req.body.newName), 
        nickname: ((req.body.newNickname === '') ? req.body.nickname : req.body.newNickname),
        membership: ((req.body.newMembership === '') ? req.body.membership : req.body.newMembership),
        rank: ((req.body.newRank === '') ? req.body.rank : req.body.newRank),
        logo: ((!req.file) ? req.body.logo : "img/" + req.file.filename)
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
})

app.delete('/members', (req, res) => {
  db.collection('members').findOneAndDelete({
    name: req.body.name, 
      nickname:req.body.nickname, 
      membership:req.body.membership, 
      rank:req.body.rank
  }, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/members', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/members', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/members');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
