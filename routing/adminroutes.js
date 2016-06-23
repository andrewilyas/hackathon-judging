var basicAuth = require('basic-auth');
var csvWriter = require('csv-write-stream')
var writer = csvWriter()
var fs = require('fs')
var Project = require('../models/project')
var Annotator = require('../models/annotators')

// Ensure the user is authorized to access the admin page
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'admin' && user.pass === 'password'){//process.env['ADMIN_PASSWORD']) {
    return next();
  } else {
    return unauthorized(res);
  };
};

// Create a new project by adding a row to the projects CSV, and adding an object to the projects DB
var createProject = function(body) {
	writer.pipe(fs.createWriteStream('projects.csv'))
	writer.write({'name': body[0], 'loc': body[1], 'desc':body[2]})
	writer.end();
    var newProj = new Project({
        'title': body[0],
        'description': body[2],
        'location': body[1],
    });
    newProj.save(function (err) {
        if (err)
            console.log(err);
    });
};

//Analagous to createProject but for Annotators
var createAnnotator = function(body) {
	writer.pipe(fs.createWriteStream('annotators.csv'));
	writer.write({'name': body[0], 'email': body[1]});
	writer.end()
    var newAnnotator = new Annotator({
        'name': body[0],
        'email': body[2],
        'secret': body[1],
    });
    newAnnotator.save(function (err) {
        if (err)
            console.log(err);
    });
};

//Module Exports
module.exports = function(app) {
    // Access admin page
    app.get('/admin', auth, function(req, res) {
        var type = req.query.type != null ? req.query.type : 'in'
        res.render('admin.html');
    });

    // Create or delete a project
	app.post('/admin/project', auth, function(req, res) {
        if (req.body.action === "Submit")
            createProject(req.body.data.split(','));
        else if (req.body.action === "Delete")
            Project.findOneAndRemove({'_id': req.body.project_id});
        res.redirect('/admin')
	});

    // Create or delete an annotator
    app.post('/admin/annotator', auth, function(req, res) {
        if (req.body.action === "Submit")
            createAnnotator(req.body.data.split('/'))
        else if (req.body.action === "Delete")
            Annotator.findOneAndRemove({'_id': req.body.annotator_id})
    })
}
