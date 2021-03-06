// HGVS support.
//
// For now, just a quick hack to recognize some reference ids.
// The filters method returns fetch options.  When we recognize a hgvs
// coordinate with reference id, we set the gene filter to the appropriate
// value, and cut the reference id from the free-text search.
//
// The effect of this is that <reference-id>:<any> will match
// any field on the variant, while restricting the results to
// the given gene. This may not be ideal, but is a compromise given
// the schedule.
//
// If the inferred gene conflicts with the user's gene filter, we
// pass the free text unmodified. The effect of this is usually
// zero matches, which is fine.

/*global module: false, require: false */
'use strict';

var _ = require('underscore');

var pathogenicity = 'Clinical_significance_ENIGMA';

var hgvsPatterns = [
    {regex: /^[Pp]athogenic(:|$)/i, value: 'Pathogenic', column: pathogenicity},
    {regex: /^[Bb]enign(:|$)/i, value: 'Benign', column: pathogenicity},
    {regex: /^([Vv]ariants of unknown significance|VUS)(:|$)/i, value: 'VUS', column: pathogenicity}
];

function filters(search, filterValues) {
    var hgvs = _.find(hgvsPatterns, pattern => search.match(pattern.regex));
    return hgvs && (filterValues[hgvs.column] == null || filterValues[hgvs.column] === hgvs.value) ?
        {
            search: search.replace(hgvs.regex, ''),
            filterValues: {
                ...filterValues,
                [hgvs.column]: hgvs.value
            }
        } : {
            search,
            filterValues
        };
}

module.exports = {
    filters: filters
};
