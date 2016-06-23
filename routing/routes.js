// Page Routes
var annotators = require('../models/annotators')

module.exports = function(app) {
	app.get('/', function (req, res) {
		var sess = req.session
        if(sess.annotators && sess.annotators['annotator_id'] != null) {
            console.log(sess.annotators['annotator_id']);
        }
        res.render('logged_out.html');
    });

	app.get('/login/:secret', function(req, res) {
        var annotator = annotators.findBySecret(req.params.secret)
		var sess = req.session
		if(!sess.annotators) {
		    sess.annotators = {}
		}
		if(!annotator) {
            sess.annotators['annotator_id'] = null
            sess.modified = true
		} else {
            sess.annotators['annotator_id'] = annotator.id
            console.log('login failed')
        }
        res.redirect('/')
	})
    
    app.get('/profile', function(req, res) {
        res.render('profile.ejs', {user: req.user, errorMessage: req.flash('error'), title: "My Profile"})
    })
}
