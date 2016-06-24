var controller = require('../controllers/controller')
var Annotator = require('../models/annotators')
var Decision = require('../models/decision')
var Project = require('../models/project')
var CrowdBT = require('../utils/crowd_bt')

var auth = function (req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.send(401);
    };
    var user = req.session.annotator_id
    if (!user) {
        return unauthorized(res);
    } else {
        return next();
    }
};

var get_current_annotator = function (session) {
	return Annotator.findOne({'_id': session.annotator_id});
}

var performVote = function(annotator, nextWon) {
    var winner_id, loser_od;
    if (nextWon) {
        winner_id = annotator.next_id
        loser_id = annotator.prev_id
    } else {
        winner_id = annotator.prev_id
        loser_id = annotator.next_id
    }
    Promise.all([Project.findById(winner_id), Project.findById(loser_id)]).then(function(x) {
        console.log(x);
        var loser = x[1],
            winner = x[0];
        res = CrowdBT.update(annotator.alpha, annotator.beta, winner.mu, winner.sigma_sq, loser.mu, loser.sigma_sq);
        console.log(res);
        annotator.alpha = res[0]
        annotator.beta = res[1]
        winner.mu = res[2]
        winner.sigma_sq = res[3]
        loser.mu = res[4]
        loser.sigma_sq = res[5]
        Promise.all([Annotator.update(annotator.id, annotator), Project.update(loser.id, loser), Project.update(winner.id, winner)]).then(function(x) {});
    })
}

module.exports = function(app) {
    app.post('/vote', function(req, res) {
        get_current_annotator(req.session).then(function(annotator) {
            if (annotator && annotator.prev_id === req.body.prev_id && annotator.next_id === req.body.next_id) { //Validity check
                if (req.body.action === 'Skip') {
                    annotator.ignore.push(annotator.next_id);
                } else {
                    var decision;
                    if (req.body.action.substring(0, 'Previous'.length) == 'Previous') {
                        performVote(annotator, false);
                        decision = new Decision({
                            'annotator_id': annotator.id,
                            'winner_id': annotator.prev_id,
                            'loser_id': annotator.current_id
                        });
                    } else if (req.body.action.substring(0, 'Current'.length) == 'Current') {
                        performVote(annotator, true)
                        decision = new Decision({
                            'annotator_id': annotator.id,
                            'winner_id': annotator.prev_id,
                            'loser_id': annotator.current_id
                        });
                    }
                    decision.save().then(function(dec) {});
                    annotator.prev_id = annotator.next_id
                    annotator.ignore.push(annotator.prev_id)
                }
                annotator.save().then(function(an){});
                res.redirect('/');
            }
        })
    });

    app.post('/begin', function (req, res) {
        get_current_annotator(req.session).then(function(annotator) {
            console.log(req.body.item_id);
            console.log(annotator.next_id);
            if (annotator.next_id === req.body.item_id) {
                console.log("HERE");
                annotator.ignore.push(annotator.next_id)
                if (req.body.action === 'Done') {
                    annotator.prev_id = annotator.next_id
                    console.log(annotator)
                } else if (req.body.action === 'Skip') {
                    annotator.next = ""
                }
                Annotator.findOneAndUpdate({'_id': annotator.id}, annotator).exec();
            }
            res.redirect('/')
        })
    });
}
