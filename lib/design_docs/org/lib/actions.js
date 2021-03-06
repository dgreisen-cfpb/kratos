// Generated by IcedCoffeeScript 1.8.0-c
(function() {
  var a, do_action, h, validate, validate_doc_update, _;

  validate = require('./validation/index');

  do_action = require('pantheon-helpers').design_docs.do_action;

  validate_doc_update = require('pantheon-helpers').design_docs.validate_doc_update.validate_doc_update;

  h = require('./helpers');

  _ = require('underscore');

  a = {};

  a.do_actions = {
    team: {
      'u+': function(team, action, actor) {
        var members;
        members = h.mk_objs(team.roles, [action.role, 'members'], []);
        return h.insert_in_place(members, action.user);
      },
      'u-': function(team, action, actor) {
        var members;
        members = h.mk_objs(team.roles, [action.role, 'members'], []);
        return h.remove_in_place(members, action.user);
      },
      'a+': function(team, action, actor) {
        var assets;
        action.asset.id = action.id;
        assets = h.mk_objs(team.rsrcs, [action.resource, 'assets'], []);
        return h.insert_in_place_by_id(assets, action.asset);
      },
      'a-': function(team, action, actor) {
        var assets, removed_asset;
        assets = h.mk_objs(team.rsrcs, [action.resource, 'assets'], []);
        removed_asset = h.remove_in_place_by_id(assets, action.asset);
        if (removed_asset) {
          return action.asset = removed_asset;
        }
      }
    },
    create: {
      't+': function(team, action, actor) {
        return _.extend(team, {
          _id: 'team_' + action.name,
          name: action.name,
          rsrcs: {},
          roles: {},
          enforce: []
        });
      }
    }
  };

  a.validate_actions = {
    team: {
      't+': function(event, actor, old_team, new_team) {
        return validate.add_team(actor, new_team);
      },
      'a+': function(event, actor, old_team, new_team) {
        return validate.add_team_asset(actor, old_team, event.resource, event.asset);
      },
      'a-': function(event, actor, old_team, new_team) {
        return validate.remove_team_asset(actor, old_team, event.resource, event.asset);
      },
      'u+': function(event, actor, old_team, new_team) {
        return validate.add_team_member(actor, old_team, null, event.role);
      },
      'u-': function(event, actor, old_team, new_team) {
        return validate.remove_team_member(actor, old_team, null, event.role);
      }
    }
  };

  a.do_action = do_action(a.do_actions, validate._get_doc_type, h.add_team_perms);

  a.validate_doc_update = validate_doc_update(a.validate_actions, validate._get_doc_type);

  module.exports = a;

}).call(this);
