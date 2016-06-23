// Main page Routes
var Annotator = require('../models/annotators')
var Project = require('../models/project')

var get_current_annotator = function (session) {
	return Annotator.findOne({'_id': session.annotator_id});
}

var addNextProject = function (annotator) {
	var unignoredProject = { '_id': { '$nin': annotator.ignore }}
	return Project.findOne(unignoredProject).then( function (proj) {
		annotator['next_id'] = proj.id;
		return Annotator.findOneAndUpdate({'_id': annotator.id}, annotator);
	});
}

module.exports = function(app) {
	app.get('/', function (req, res) {
		var sess = req.session
		var annotator;
		get_current_annotator(sess).then( function(_annotator) {
			annotator = _annotator;
			if(!annotator) {
				res.render('logged_out.html');
			} else {
				return addNextProject(annotator)
			}
		}).then( function(annotator) {
			if(!annotator) {
				return;
			}
			if (!annotator.next_id) {
				res.render('wait.html');
			} else {
				if (!annotator.prev_id) {
					Project.findOne({'_id': annotator.next_id}).then(function(proj) {
						res.render('begin.html', {item: proj})
					})
				} else {
					var prev, next;
					Project.findOne({id: annotator.next_id}).then(function(proj) {
						next = proj
						return Project.findOne({id: annotator.prev_id})
					}).then(function(proj) {
						prev = proj
						res.render('vote.html', {prev: prev, next: next})
					})
				}
			}
		});
    });

	app.get('/login/:secret', function(req, res) {
        Annotator.findOne({'secret': req.params.secret}).then(function (annotator) {
			var sess = req.session
			if(!annotator) {
	            sess.annotator_id = null
	            sess.modified = true
			} else {
	            sess.annotator_id = annotator.id
	        }
	        res.redirect('/')
		});
	});

	app.get('/logout', function(req, res) {
		var sess = req.session
		sess.annotator_id = null
		return res.redirect('/')
	})

    app.get('/profile', function(req, res) {
        res.render('profile.ejs', {user: req.user, errorMessage: req.flash('error'), title: "My Profile"})
    })
}
