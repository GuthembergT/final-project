module.exports = function(app, passport, db, multer, aws) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // MEMBERS SECTION =========================
    app.get('/members', isLoggedIn, function(req, response) {
        db.collection('members').find().toArray((err, result) => {
          db.collection('memberships').find().toArray((error, res) => {
            console.log(result.length);
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

    // INDIVIDUAL MEMBER ===========================
    app.get('/member', isLoggedIn, function(req, response) {
        db.collection('members').findOne({name:req.body.name}, (err, result) => {
            console.log(result.length);
            if (error) return console.log(error);
            response.render('member.ejs', {
              user : req.user,
              info: result
            });
          });
    });

    // MEMBERSHIP SECTION =========================
    app.get('/memberships', isLoggedIn, function(req, response) {
      db.collection('memberships').find().toArray((error, result) => {
        console.log(result.length);
        if (error) return console.log(error);
        response.render('memberships.ejs', {
          user : req.user,
          membership: result
        })
      })
    });

    app.post('/addMembership', isLoggedIn, function(req, response) {
      console.log(req.body);
      const requestInfo = {
        name: req.body.name, 
        cost: req.body.cost, 
        duration: req.body.duration, 
        durationUnit: req.body.durationUnit, 
        limit: req.body.limit }
      if('occurences' in req.body){
        requestInfo.limitNumber = req.body.limitNumber;
        requestInfo.occurences = req.body.occurences;
      }
        if (requestInfo.name != null &&
            requestInfo.cost != null &&
            requestInfo.duration != null &&
            requestInfo.durationUnit != null) 
          db.collection('memberships').insertOne( requestInfo, (err, result) => {
            if(err) return err;
            response.redirect('/memberships');
        })
    })

    app.post('/membershipLog', isLoggedIn, (req, res) => {
      db.collection('membershipLog').insertOne({ 
        member: req.body.userId, 
        membership: req.body.membership,
        rate: req.body.rate, 
        startDate: req.body.startDate,
        endDate: req.body.endDate
      })
    })

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".png")
  }
})

var upload = multer({
  storage: multerS3({
      s3: s3,
      bucket: 'adminpeace',
      key: function (req, file, cb) {
          console.log(file);
          cb(null, file.originalname); //use Date.now() for unique file keys
      }
  })
});


app.post('/add', upload.single('file-to-upload'), (req, res) => {
  console.log(req.file);
  const reqInfo = {
    name: req.body.name, 
    nickname:req.body.nickname, 
    membership:req.body.membership, 
    rank:req.body.rank, 
    profile: (req.file) ? "img/" + req.file.filename : null
  }
  if(reqInfo.membership != 'None'){
    reqInfo.startDate = req.body.startDate;
    reqInfo.endDate = req.body.endDate;
  }
  db.collection('members').save( reqInfo, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database');
    res.redirect('/members');
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

    // AWS =========================================

app.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  console.log(fileName);
  const s3Params = {
    Bucket: 'adminpeace',
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
