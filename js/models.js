// Models that can be plotted/visualised in the final window
var DysonFID = require('./dyson.js').DysonFID;
var Distributions = require('./distributions.js');

var ArgDef = function(name, type, fullname, description, min, max) {
    this.name = name;
    this.type = type;
    this.fullname = fullname;
    this.description = description;

    if (type == 'float') {
        this.min = min || 0;
        this.max = max || 1;
    }
}

ArgDef.prototype = {

    default: function() {
        if (this.type == 'bool') {
            return false;
        }
        else if (this.type == 'float') {
            return this.min;
        }

        return null;
    }
}

var Model = function(distribution, D, n, dt, tsteps, args) {
    this.D = D || 1.0; // Distribution spread parameter
    this.n = n || 36; // Default number of points
    this.distrF = distribution;
    this.dt = dt || 0.01;
    this.tsteps = tsteps || 150;
    this.nu = 0;
    this.args = args || [];
    this.arg_vals = args.map(function(a) { return a.default(); });

}

Model.prototype = {

    update: function() {
        this.t = [0.0];
        this.fid = [1.0];

        distr = this.distrF.apply(null, [this.D, this.n].concat(this.arg_vals));
        var dfid = new DysonFID(distr.freqs, this.dt, this.nu, distr.weights);

        for (var i = 0; i < this.tsteps; ++i) {
            dfid.step();
            this.t.push(dfid.t);
            this.fid.push(dfid.FID);
        }
    }
}

exports.UniaxialGaussianModel = function() {
    Model.call(this, Distributions.UniaxialGaussian, 
                                          5.0, 36, 0.01, 150,
                                          []);
}
exports.UniaxialGaussianModel.prototype = Object.create(Model.prototype);
exports.UniaxialGaussianModel.fullname = "Gaussian distribution (along z axis)";

exports.SphericalGaussianModel = function() {
    Model.call(this, Distributions.SphericalGaussian, 
                     5.0, 36, 0.01, 150,
                     [new ArgDef('B_external', 'float',
                                 'External magnetic field', 
                                 'External field applied to the sample',
                                 0.0, 30.0),
                      new ArgDef('is_transverse', 'bool',
                                 'Use transverse setup', 
                                 'If checked, the external field is applied in a direction transverse to the magnetization')]);
}
exports.SphericalGaussianModel.prototype = Object.create(Model.prototype);
exports.SphericalGaussianModel.fullname = "Gaussian distribution (spherical)";