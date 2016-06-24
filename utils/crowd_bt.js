//parameters chosen according to experiments in paper
var gamma = 0.1 // tradeoff parameter
var lambda = 1 // regularization parameter
var kappa = 0.0001 //  to ensure positivity of variance
var mu_prior = 0
var sig_sq_prior = 1
var alpha_prior = 10
var beta_prior = 1
var episilon = 0.25 // epsilon-greedy
/* compute.io libraries */
var betaln = require( 'math-betaln' );
var psi = require( 'compute-digamma' );
/* db elements */
var Project = require('../models/project')
var Promise = require('bluebird')

exports.shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

exports.argmax = function(f, xs) {
    var curr_max_index = null;
    for (var i = 0; i < xs.length; i ++) {
        if (curr_max_index == null || f(xs[i]) > f(xs[curr_max_index])) {
            curr_max_index = i;
        }
    }
    return xs[curr_max_index];
}

// via https://en.wikipedia.org/wiki/Normal_distribution
function divergenceGaussian(mu1, ss1, mu2, ss2) {
    var ratio = ss1/ss2;
    return Math.pow(mu1 - mu2, 2) / (2*ss2) + (ratio - 1 - Math.log(ratio))/2
}

// via https://en.wikipedia.org/wiki/Beta_distribution
function divergenceBeta(a1, b1, a2, b2) {
    return betaln(a2, b2)-betaln(a1,b1)+(a1-a2)*psi(a1)+(b1-b2)*psi(b1)+(a2-a1+b2-b1)*psi(a1 + b1)
}

// returns new (alpha, beta, mu_winner, sigma_sq_winner, mu_loser, sigma_sq_loser)
exports.update = function(a, b, mw, ssw, ml, ssl) {
    var uaub = updatedAnnotator(a, b, mw, ssw, ml, ssl)
    var ua = uaub[0]
    var ub = uaub[1]
    var umwuml = updatedMus(a, b, mw, ssw, ml, ssl)
    var umw = umwuml[0]
    var uml = umwuml[1]
    var usswussl = updatedSS(a, b, mw, ssw, ml, ssl)
    var ussw = usswussl[0]
    var ussl = usswussl[1]
    return [ua, ub, umw, ussw, uml, ussl]
}

exports.expectedInfoGainFunction = function(annotator) {
    if(annotator.prev_id === "") return Promise.resolve(null);
    return Project.findById(annotator.prev_id).then(function(prev) {
        var infoGainFunction = function (i) {
            return Math.random()
            return expectedInfoGain(annotator.alpha, annotator.beta, prev.mu, prev.sigma_sq, i.mu, i.sigma_sq)
        };
        return Promise.resolve(infoGainFunction);
    })
}

function expectedInfoGain(a, b, ma, ssa, mb, ssb) {
    var abc = updatedAnnotator(a, b, ma, ssa, mb, ssb)
    var a1 = abc[0],
        b1 = abc[1],
        c = abc[2];
    var ma1mb1 = updatedMus(a, b, ma, ssa, mb, ssb)
    var ma1 = ma1mb1[0]
    var mb1 = ma1mb1[1]
    var SSs = updatedSS(a, b, ma, ssa, mb, ssb)
    var ssa1 = SSs[0]
    var ssb1 = SSs[1]
    var a2b2 = updatedAnnotator(a, b, mb, ssb, ma, ssa)
    var a2 = a2b2[0]
    var b2 = a2b2[1]
    mb2ma2 = updatedMus(a, b, mb, ssb, ma, ssa)
    var mb2 = mb2ma2[0]
    var ma2 = mb2ma2[1]
    var SS2s = updatedSS(a, b, mb, ssb, ma, ssa)
    var ssb2 = SS2s[0]
    var ssa2 = SS2s[1]
    return c*(divergenceGaussian(ma1, ssa1, ma, ssa) + divergenceGaussian(mb1, ssb1, mb, ssb) + gamma*divergenceBeta(a1, b1, a, b)) + (1-c)*(divergenceGaussian(ma2, ssa2, ma, ssa) + divergenceGaussian(mb2, ssb2, mb, ssb) + gamma*divergenceBeta(a2, b2, a, b))
}

// returns (updated mu of winner, updated mu of loser)
function updatedMus(a, b, mw, ssw, ml, ssl) {
    var mult = a*Math.exp(mw)/Math.pow(a*Math.exp(mw) + b*Math.exp(ml), 2) - Math.exp(mw)/(Math.exp(mw) + Math.exp(ml))
    var uMW = mw + ssw*mult
    var uML = ml - ssl*mult
    return [uMW, uML]
}

// returns (updated sigma squared of winner, updated sigma squared of loser)
function updatedSS(a, b, mw, ssw, ml, ssl) {
    var mult = (a*Math.exp(mw))*b*ml/Math.pow(a*Math.exp(mw) + b*Math.exp(ml), 2) - Math.exp(mw)*Math.exp(ml)/Math.pow(Math.exp(mw) + Math.exp(ml), 2)
    var uSSW = ssw * Math.max(1+ssw*mult, kappa);
    var uSSL = ssl * Math.max(1+ssl*mult, kappa);
    return [uSSW, uSSL]
}

// returns (updated alpha, updated beta, pr i >k j which is c)
function updatedAnnotator(a, b, mw, ssw, ml, ssl) {
    var c1 = Math.exp(mw)/(Math.exp(mw)+Math.exp(ml)) + 0.5*(ssw + ssl)*(Math.exp(mw) * Math.exp(ml) * (Math.exp(ml) - Math.exp(mw))) / Math.pow(Math.exp(mw) + Math.exp(ml), 3);
    var c2 = 1 - c1;
    var c = (c1*a + c2*b)/(a+b);
    var expt = (c1*(a+1)*a + c2*a*b)/(c*(a+b+1)*(a+b));
    var exptSq = (c1*(a+2)*(a+1)*a + c2*(a+1)*a*b)/(c*(a+b+2)*(a+b+1)*(a+b));
    var variance = (exptSq - Math.pow(expt, 2));
    var updated_a = ((expt - exptSq)*expt)/variance;
    var updated_b = (expt - exptSq)*(1-expt)/variance;
    return [updated_a, updated_b, c];
}
