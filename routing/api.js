var controller = require('../controllers/controller')
var Annotator = require('../models/annotators')
var auth = function (req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.send(401);
    };
    var user = req.session['annotator_id']
    if (!user) {
        return unauthorized(res);
    } else {
        return next();
    }
};

module.exports = function(app) {
    app.post('/begin', auth, function(req, res) {
        Annotator.findBySecret(req.session[annotator_id])
    })
}
