// Generated by CoffeeScript 1.9.2
(function() {
  var actionHandlers, auth, couchUtils, doAction, getDocType, prepDoc, shared, utils, validation, validationFns;

  validation = require('./validation');

  validationFns = validation.actions;

  auth = validation.auth;

  doAction = require('pantheon-helpers').doAction;

  couchUtils = require('./couch_utils');

  actionHandlers = require('./actions');

  shared = require('./shared');

  utils = require('./utils');


  /*
  the TEAM prepDocFn requires the node-only validation library,
  it therefore cannot be used in couch. We monkeypatch in node
  to add it.
   */

  shared.prepDocFns.team = function(team, actor) {

    /*
    return a copy of the team with permissions metadata added to the roles and resources
     */
    var i, j, len, len1, perms, proxyActionFn, proxyActionName, ref, ref1, ref2, role_name, rsrc_auth, rsrc_name;
    ref = auth.resources;
    for (i = 0, len = ref.length; i < len; i++) {
      rsrc_name = ref[i];
      rsrc_auth = auth[rsrc_name];
      perms = {
        add: rsrc_auth.add_team_asset(actor, team),
        remove: rsrc_auth.remove_team_asset(actor, team),
        proxy: {}
      };
      ref1 = rsrc_auth.proxy || {};
      for (proxyActionName in ref1) {
        proxyActionFn = ref1[proxyActionName];
        perms.proxy[proxyActionName] = proxyActionFn(actor, team);
      }
      utils.mkObjs(team.rsrcs, [rsrc_name, 'perms'], perms);
    }
    ref2 = auth.roles.team;
    for (j = 0, len1 = ref2.length; j < len1; j++) {
      role_name = ref2[j];
      utils.mkObjs(team.roles, [role_name, 'perms'], {
        add: auth.add_team_member(actor, team, role_name),
        remove: auth.remove_team_member(actor, team, role_name)
      });
    }
    return team;
  };

  getDocType = shared.getDocType;

  prepDoc = shared.prepDoc;

  module.exports = {
    doAction: doAction(null, couchUtils, actionHandlers, validationFns, getDocType, prepDoc)
  };

}).call(this);