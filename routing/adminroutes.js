var basicAuth = require('basic-auth');
var csvWriter = require('csv-write-stream')
var writer = csvWriter()
var fs = require('fs')
var Project = require('../models/project')
var Annotator = require('../models/annotators')
var Decision = require('../models/decision')
var uuid = require('node-uuid')

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
    var newProj = new Project({
        'title': body[0],
        'description': body[2],
        'location': body[1],
    });
    return newProj.save(); // Return a promise
};

//Analagous to createProject but for Annotators
var createAnnotator = function(body) {
	writer.pipe(fs.createWriteStream('annotators.csv'));
	writer.write({'name': body[0], 'email': body[1]});
    var newAnnotator = new Annotator({
        'name': body[0],
        'email': body[1],
        'secret': uuid.v4(),
    });
    return newAnnotator.save(); // Return a promise
};

//Module Exports
module.exports = function(app) {
    // Access admin page
    app.get('/admin', auth, function(req, res) {
        var type = req.query.type != null ? req.query.type : 'in'
        var annotators = null,
            items = null,
            decisions = [],
            counts = {},
            item_counts = {};
        // Fill arguments with promise chain
        Project.find().sort('mu').then(function(_items) {
            items = _items;
            for(var i = 0; i < items.length; i++) {
                item_counts[items[i]['_id']] = 0
            }
            return Annotator.find();
        }).then(function(_annotators) {
            annotators = _annotators
            for(var i = 0; i < annotators.length; i++) {
                counts[annotators[i]['_id']] = 0
            }
            return Decision.find();
        }).then(function(_decisions) {
            decisions = _decisions;
            for (var i = 0; i < decisions.length; i++) {
                var a = decisions[i].annotator_id
                var w = decisions[i].winner_id
                var l = decisions[i].loser_id
                counts[a] = counts[a] + 1 || 1
                item_counts[w] = item_counts[w] + 1 || 1
                item_counts[l] = item_counts[l] + 1 || 1
            }
            console.log(annotators)
            res.render('admin.html', {items: items, annotators: annotators, counts: counts, item_counts: item_counts, votes: decisions.length})
        });
    });

    // Create or delete a project
	app.post('/admin/project', auth, function(req, res) {
        if (req.body.action === "Submit")
            createProject(req.body.data.split(',')).then(function(doc) {
                res.redirect('/admin');
            });
        else if (req.body.action === "Delete")
            Project.findOneAndRemove({'_id': req.body.project_id}).then(function (doc) {
                res.redirect('/admin');
            });
	});

    // Create or delete an annotator
    app.post('/admin/annotator', auth, function(req, res) {
        if (req.body.action === "Submit")
            createAnnotator(req.body.data.split(',')).then(function(doc) {
                res.redirect('/admin');
            })
        else if (req.body.action === "Delete")
            Annotator.findOneAndRemove({'_id': req.body.annotator_id}).then(function (doc) {
                res.redirect('/admin')
            })
    })
}
