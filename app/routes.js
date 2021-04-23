module.exports = function(app, passport, db, multer, multerS3, s3, aws, ObjectId, fs) {

aws.config.region = 'us-east-1';

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
      db.collection('classes').find().toArray((err, result) => {
        // var days = [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']]
        res.render('index.ejs', { classes: result });
      })
    });

    // USER'S PROFILE ===========================================================
    app.get('/newProfile', isLoggedIn, function (req, response) {
      db.collection('profiles').find({user: req.user._id}).toArray((err, result) => {
        if (err) return console.log(err);
        if (result.length > 0)
          response.redirect(`/${req.user_id}`) // GET request is at the bottom of the file.
        else
          response.render('newProfile.ejs');
      })
    });
    
    app.post('/createProfile', isLoggedIn, function(req, response) {
      const profile = {
        userId: req.user._id,
        first: req.user.local.first,
        last: req.user.local.last,
        nickname: req.body.nickname,
        email: req.user.local.email,
        telephone: (req.body.telephone) ? req.body.telephone : '',
        address: (req.body.address) ? req.body.address : '',
        rank: '',
        finance: [],
        membership: 'None',
        attendance: [],
        picture: (req.body.picture) ? req.body.picture : 'defaultProfile.png',
        signupDate: req.user.local.signupDate
      }
      db.collection('profiles').insertOne(profile, (err, result) => {
        if (err) return console.log(err);
        console.log('Profile Created!')
        response.redirect(`/${req.user._id}`);
      })
    })

    app.put('/editProfile', isLoggedIn, function(req, response) {
      var referencedId = req.headers.referer.slice(req.headers.referer.lastIndexOf('/') + 1)
      console.log(referencedId);
      var userId = (referencedId === ':id') ? req.user._id : ObjectId(referencedId);
      const data = {};
      for(property in req.body)
        data[property] = req.body[property];

      db.collection('profiles').findOneAndUpdate({userId: userId}, {
          $set: data
        }, {}, (err, result) => {
          if (err) return console.log(err);
          response.send('Profile Updated');
        });
    });


    // MEMBERS SECTION =========================
    app.get('/members', isLoggedIn, isAdmin, function(req, response) {
        db.collection('profiles').find().toArray((err, result) => {
          db.collection('memberships').find().toArray((error, res) => {
            result.forEach(profile => {
              if(profile.picture !== 'defaultProfile.png') {
                var pictureId = profile.picture.slice(0, profile.picture.lastIndexOf('.'));
                var params = { Bucket: 'adminpeace', Key: pictureId}
                s3.getObject(params, function(er, data) {
                  if (er) return console.log(er);
                  fs.writeFileSync(`public/img/${profile.picture}`, data.Body)
                });
                console.log('file downloaded successfully')
              }
            });
              response.render('members.ejs', {
                user : req.user,
                members: result,
                membership: res
              });
            if (error) return console.log(error);
          });
          if (err) return console.log(err)
        });
    });

    // INDIVIDUAL MEMBER ===========================
    app.get('/member/:id', isLoggedIn, isAdmin, function(req, response) {
        db.collection('members').findOne({name:req.body.name}, (err, result) => {
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
        if (error) return console.log(error);
        response.render('memberships.ejs', {
          user : req.user,
          membership: result
        })
      })
    });

    app.post('/addMembership', isLoggedIn, function(req, response) {
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

    // LOCATIONS SECTION ==============================
    app.get('/locations', isLoggedIn, isAdmin, function(req, res) {
      db.collection('locations').find().toArray((err, result) => {
        if (err) return console.log(err);
        res.render('locations.ejs', {
          locations: result
        })
      })
    });

    app.get('/newLocation', isLoggedIn, isAdmin, function(req, res) {
      res.render('newLocation.ejs');
    })

    app.post('/newLocation', isLoggedIn, function(req, res) {
      const data = {
        name: req.body.name,
        address: {
          number: req.body.number,
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip
        }
      }
      db.collection('locations').insertOne(data, (err, result) => {
        if(err) return console.log(err);
        console.log('Location added to database');
        res.redirect('/locations');
      });
    })

    // CLASSES SECTION ==============================
    app.get('/classes', isLoggedIn, isAdmin, function (req, res) {
      db.collection('classes').find().toArray((err, result) => {
        res.render('classes.ejs', {
          classes: result
        });
      })
    });

    app.get('/newClass', isLoggedIn, isAdmin, function (req, res) {
      db.collection('locations').find().toArray((err, result) => {
        res.render('newClass.ejs', {
          locations: result
        });
      })
    });

    app.get('/class/:id', isLoggedIn, isAdmin, function(req, res) {
      db.collection('classes').findOne({_id: ObjectId(req.params.id)}, (err, result) => {
        if (err) return console.log(err);
        res.render('class.ejs', {
          info: result
        })
      })
    })

    app.post('/newClass', isLoggedIn, isAdmin, function (req, res) {
      db.collection('classes').insertOne(req.body, (err, result) => {
        if (err) return console.log(err);
        res.redirect('/classes');
      })
    })

    // CALENDAR SECTION ===============================================================
    app.get('/calendar', function(req, res) {
      res.render('calendar.ejs', {cal : calcCalendar(new Date().getFullYear())});
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
});


var uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'adminpeace',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

app.post('/members', uploadS3.single('file-to-upload'), (req, res) => {
  console.log(req);
  console.log(uploadS3);
  var first = req.body.name.split(' ')[0], last = req.body.name.split(' ')[1];
  const reqInfo = {
        userId: '',
        first: first,
        last: last,
        nickname: req.body.nickname,
        email: '',
        telephone: (req.body.telephone) ? req.body.telephone : '',
        address: (req.body.address) ? req.body.address : '',
        rank: '',
        finance: [],
        membership: 'None',
        attendance: [],
        picture: (req.file.key) ? req.file.key + '.png' : 'defaultProfile.png',
        signupDate: new Date(Date.now())
  }
  if(reqInfo.membership != 'None'){
    reqInfo.startDate = req.body.startDate;
    reqInfo.endDate = req.body.endDate;
  }
  db.collection('profiles').save( reqInfo, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database');
    res.redirect('/members');
  })
})

app.put('/members', uploadS3.single('file-to-upload'), (req, res) => {
  console.log(req.body)
  const fields = ['First', 'Last', 'Nickname', 'Rank', 'Profile']
  const data = {
    first: req.body.first,
    last: req.body.last, 
    nickname:req.body.nickname,
    rank:req.body.rank,
    picture: req.body.profile
  };
  const updates = {};
  fields.forEach(f => { if (`new${f}` in req.body) updates[req.body[`new${f}`]] = req.body[`new${f}`]});
  if (req.file)
    updates.picture = req.file.key + '.png';

  db.collection('profiles').findOneAndUpdate(data,{ $set: updates }, 
    { sort: {_id: -1}
    }, (err, result) => {
      console.log(result);
      if (err) return res.send(err)
      res.send();
    })
})

app.delete('/members', (req, res) => {
  // console.log(req.body);
  db.collection('profiles').findOneAndDelete(req.body, (err, result) => {
    console.log(result);
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})


// ROLE CHANGE =================================================================
app.put('/role', isLoggedIn, isAdmin, function (req, res) {
  const id = { _id: ObjectId(req.headers.referer.slice(req.headers.referer.lastIndexOf('/') + 1))}
  db.collection('users').findOneAndUpdate(id, {
    $set: { "local.role": req.body.role }
  }, {}, (err, result) => {
    console.log(result);
    if (err) return console.log(err);
    res.send('Role updated!');
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
            successRedirect : '/:id', // redirect to the secure profile section
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
            successRedirect : '/newProfile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


        app.get('/:id', isLoggedIn, function(req, response) {
          // console.log(req)
          var userId;
          if(req.params.id === ':id') 
            userId = req.user._id;
          else if (req.user.local.role === 'admin')
            userId = ObjectId(req.params.id)
          else
            userId = req.user._id;
          db.collection('profiles').findOne({userId: userId}, (err, result) => {
            db.collection('users').findOne({_id: userId}, (error, user) => {
              response.render('profile.ejs', {
                info: result,
                admin: (req.user.local.role === 'admin'),
                selfId: req.user._id,
                role: user.local.role
              })
            });
          });
        });

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

function isAdmin(req, res, next) {
  if (req.user.local.role == 'admin')
    return next();

  res.redirect('/');
}

function calcCalendar(year) {
  let arr = new Array(12);
  for (let x = 0; x < arr.length; x++) {
      arr[x] = new Array(6);

  }

  for (let x = 0; x < arr.length; x++) {
      for (let y = 0; y < arr[x].length; y++) {
          arr[x][y] = new Array(7);
      }
  }
  for (let month = 0; month < arr.length; month++) {
      let startDayInWeek = new Date(year, month, 0).getDay() + 1;
      let monthLong = new Date(year, month + 1,0).getDate() + 1;
      let beforCount = 0;
      let counter = 1;
      let startCount = false;

      for (let x = 0; x < arr[month].length; x++) {
          for (let y = 0; y < arr[month][x].length; y++) {
              if (beforCount == startDayInWeek) {
                  startCount = true;
              } else {
                  beforCount++;
              }
              if (startCount == true) {
                  arr[month][x][y] = counter;
                  counter++;
              } else {
                  arr[month][x][y] = "";
              }
              if (counter > monthLong) {
                  arr[month][x][y] = "";
              }
          }
      }
  }
  return arr;
}