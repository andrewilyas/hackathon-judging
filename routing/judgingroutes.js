/*var Annotator = require('../models/annotators')
var Decision = require('../models/decision')

var get_current_annotator = function (session) {
	return Annotator.findOne({'_id': session.annotator_id});
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
                        performVote(annotator, nextWon = false);
                        decision = new Decision({
                            'annotator_id': annotator.id,
                            'winner_id': annotator.prev_id,
                            'loser_id': annotator.current_id
                        });
                    } else if (req.body.action.substring(0, 'Current'.length) == 'Current') {
                        performVote(annotator, nextWon = true)
                        decision = new Decision({
                            'annotator_id': annotator.id,
                            'winner_id': annotator.prev_id,
                            'loser_id': annotator.current_id
                        });
                    }
                    decision.save().exec();
                    annotator.prev_id = annotator.next_id
                    annotator.ignore.push(annotator.prev_id)
                }
                annotator.save().exec();
                res.redirect('/');
            }
        })
    });

    app.post('/begin', function (req, res) {
        var annotator = get_current_annotator(req.session)
        if (annotator && annotator.next_id == request.body.item_id) {
            annotator.ignore.push(annotator.next_id)
            if (req.body.action === 'Done') {
                annotator.prev = annotator.next
                annotator.next = choose_next(annotator)
            } else if (req.body.action === 'Skip') {
                annotator.next = ""
            }
            annotator.save().exec();
        }
        res.redirect('/')
    });
}*/
