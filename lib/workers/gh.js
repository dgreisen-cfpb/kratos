// Generated by IcedCoffeeScript 1.8.0-c
(function() {
  var add_asset, add_remove_user, add_user, conf, couch_utils, create_team, exec, get_authenticated_repo_url, get_gh_team_id, get_gh_team_type, gh_conf, git_client, git_url, handle_add_remove_gh_rsrc_role, handle_add_remove_user, handle_create_team, handle_remove_repo_event, iced, output, remove_repo, remove_user, request, teams, user_db, users, utils, _, __iced_k, __iced_k_noop, _get_or_create_repo,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  _ = require('underscore');

  request = require('request');

  couch_utils = require('../couch_utils');

  users = require('../api/users');

  teams = require('../api/teams');

  utils = require('../utils');

  exec = require('child_process').exec;

  conf = require('../config');

  gh_conf = conf.RESOURCES.GH;

  git_client = request.defaults({
    auth: gh_conf.ADMIN_CREDENTIALS,
    headers: {
      'User-Agent': 'cfpb-kratos'
    },
    json: true
  });

  git_url = 'https://api.github.com';

  user_db = couch_utils.nano_admin.use('_users');

  get_authenticated_repo_url = function(repo_url) {
    var authed_repo_url, repo_parts;
    repo_parts = repo_url.split('//');
    repo_parts[1] = gh_conf.ADMIN_CREDENTIALS.pass + ':x-oauth-basic@' + repo_parts[1];
    authed_repo_url = repo_parts.join('//');
    return authed_repo_url;
  };

  get_gh_team_type = function(user, role) {
    var is_contractor, _ref;
    is_contractor = (_ref = user.data) != null ? _ref.contractor : void 0;
    if (is_contractor) {
      return 'write';
    } else {
      return 'admin';
    }
  };

  get_gh_team_id = function(gh_teams, gh_team_type, callback) {
    var team_id;
    team_id = gh_teams[gh_team_type];
    return callback(null, team_id);
  };

  add_remove_user = function(user, role, action_name, team, callback) {
    var action, body, err, gh_team_id, gh_team_type, gh_teams, gh_username, resp, url, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    console.log('add_remove_user', user.username, role, action_name, team.name);
    if (action_name === 'a+' && __indexOf.call(user.roles, 'gh|user') < 0) {
      return callback();
    }
    console.log('past first hurdle');
    gh_teams = team.rsrcs.gh.data;
    gh_username = (_ref = user.rsrcs.gh) != null ? _ref.username : void 0;
    if (!gh_username) {
      return callback({
        user: user,
        err: 'no github username'
      });
    }
    gh_team_type = get_gh_team_type(user, role);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/opt/kratos/src/workers/gh.iced"
        });
        get_gh_team_id(gh_teams, gh_team_type, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return gh_team_id = arguments[1];
            };
          })(),
          lineno: 53
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (err) {
          return callback(err);
        }
        console.log('gh_team_id', gh_team_id);
        action = action_name === 'u+' ? git_client.put : git_client.del;
        url = git_url + '/teams/' + gh_team_id + '/memberships/' + gh_username;
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/opt/kratos/src/workers/gh.iced"
          });
          action(url, utils.process_resp(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                resp = arguments[1];
                return body = arguments[2];
              };
            })(),
            lineno: 59
          })));
          __iced_deferrals._fulfill();
        })(function() {
          console.log(err, body);
          return callback(err);
        });
      };
    })(this));
  };

  add_user = function(user, role, team, callback) {
    return add_remove_user(user, role, 'a+', team, callback);
  };

  remove_user = function(user, role, team, callback) {
    return add_remove_user(user, role, 'a-', team, callback);
  };

  handle_add_remove_user = function(event, team, callback) {
    var action_name, err, role, user, user_id, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    action_name = event.a;
    user_id = event.v;
    role = event.k;
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/opt/kratos/src/workers/gh.iced"
        });
        users.get_user(user_id, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return user = arguments[1];
            };
          })(),
          lineno: 77
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (err) {
          return callback(err);
        }
        return add_remove_user(user, role, action_name, team, callback);
      };
    })(this));
  };

  _get_or_create_repo = function(repo_name, callback) {
    var body, err, push_repo_url, resp, stderr, stdout, template_dir, url, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    url = git_url + '/organizations/' + gh_conf.ORG_ID + '/repos';
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/opt/kratos/src/workers/gh.iced"
        });
        git_client.post({
          url: url,
          json: {
            name: repo_name,
            description: "",
            homepage: "https://github.com",
            "private": false,
            has_issues: true,
            has_wiki: true,
            has_downloads: true
          }
        }, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              resp = arguments[1];
              return body = arguments[2];
            };
          })(),
          lineno: 96
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (err) {
          return callback(err);
          return __iced_k();
        } else {
          (function(__iced_k) {
            if (resp.statusCode === 422) {
              url = git_url + '/repos/' + gh_conf.ORG_NAME + '/' + repo_name;
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/opt/kratos/src/workers/gh.iced"
                });
                git_client.get(url, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      err = arguments[0];
                      resp = arguments[1];
                      return body = arguments[2];
                    };
                  })(),
                  lineno: 101
                }));
                __iced_deferrals._fulfill();
              })(function() {
                if (err) {
                  return callback(err);
                } else if (resp.statusCode >= 400) {
                  return callback({
                    msg: body,
                    code: resp.statusCode
                  });
                } else {
                  return callback(null, body);
                }
                return __iced_k();
              });
            } else {
              (function(__iced_k) {
                if (resp.statusCode >= 400) {
                  return callback({
                    msg: body,
                    code: resp.statusCode
                  });
                  return __iced_k();
                } else {
                  template_dir = './template_repo/';
                  (function(__iced_k) {
                    __iced_deferrals = new iced.Deferrals(__iced_k, {
                      parent: ___iced_passed_deferral,
                      filename: "/opt/kratos/src/workers/gh.iced"
                    });
                    exec('git init', {
                      cwd: template_dir
                    }, __iced_deferrals.defer({
                      assign_fn: (function() {
                        return function() {
                          err = arguments[0];
                          stdout = arguments[1];
                          return stderr = arguments[2];
                        };
                      })(),
                      lineno: 112
                    }));
                    __iced_deferrals._fulfill();
                  })(function() {
                    if (err) {
                      return callback(err);
                    }
                    (function(__iced_k) {
                      __iced_deferrals = new iced.Deferrals(__iced_k, {
                        parent: ___iced_passed_deferral,
                        filename: "/opt/kratos/src/workers/gh.iced"
                      });
                      exec('git pull "' + gh_conf.TEMPLATE_REPO + '"', {
                        cwd: template_dir
                      }, __iced_deferrals.defer({
                        assign_fn: (function() {
                          return function() {
                            err = arguments[0];
                            stdout = arguments[1];
                            return stderr = arguments[2];
                          };
                        })(),
                        lineno: 115
                      }));
                      __iced_deferrals._fulfill();
                    })(function() {
                      if (err) {
                        return callback(err);
                      }
                      push_repo_url = get_authenticated_repo_url(body.clone_url);
                      (function(__iced_k) {
                        __iced_deferrals = new iced.Deferrals(__iced_k, {
                          parent: ___iced_passed_deferral,
                          filename: "/opt/kratos/src/workers/gh.iced"
                        });
                        exec('git push "' + push_repo_url + '" master', {
                          cwd: template_dir
                        }, __iced_deferrals.defer({
                          assign_fn: (function() {
                            return function() {
                              err = arguments[0];
                              stdout = arguments[1];
                              return stderr = arguments[2];
                            };
                          })(),
                          lineno: 119
                        }));
                        __iced_deferrals._fulfill();
                      })(function() {
                        if (err) {
                          return callback(err);
                        }
                        return callback(null, body);
                        return __iced_k();
                      });
                    });
                  });
                }
              })(__iced_k);
            }
          })(__iced_k);
        }
      };
    })(this));
  };

  add_asset = function(repo_name, team, callback) {
    var err, errs, existing_repo, new_repo, new_repo_data, team_id, team_name, url, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    existing_repo = _.findWhere((_ref = team.rsrcs.gh) != null ? _ref.assets : void 0, {
      'name': repo_name
    });
    if (existing_repo) {
      return callback(null);
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/opt/kratos/src/workers/gh.iced"
        });
        _get_or_create_repo(repo_name, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return new_repo_data = arguments[1];
            };
          })(),
          lineno: 129
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (err) {
          return callback(err);
          return __iced_k();
        } else {
          new_repo = {
            gh_id: new_repo_data.id,
            name: new_repo_data.name,
            full_name: new_repo_data.full_name
          };
          errs = {};
          (function(__iced_k) {
            var _ref1, _ref2;
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/opt/kratos/src/workers/gh.iced"
            });
            _ref2 = ((_ref1 = team.rsrcs.gh) != null ? _ref1.data : void 0) || {};
            for (team_name in _ref2) {
              team_id = _ref2[team_name];
              url = git_url + '/teams/' + team_id + '/repos/' + new_repo.full_name;
              git_client.put(url, utils.process_resp(__iced_deferrals.defer({
                assign_fn: (function(__slot_1, __slot_2) {
                  return function() {
                    return __slot_1[__slot_2] = arguments[0];
                  };
                })(errs, team_id),
                lineno: 142
              })));
            }
            __iced_deferrals._fulfill();
          })(function() {
            errs = utils.compact_hash(errs);
            if (errs) {
              return callback(errs);
            } else {
              return callback(null, new_repo);
            }
            return __iced_k();
          });
        }
      };
    })(this));
  };

  remove_repo = function(repo_full_name, team, callback) {
    var errs, team_id, team_name, url, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    errs = {};
    (function(_this) {
      return (function(__iced_k) {
        var _ref, _ref1;
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/opt/kratos/src/workers/gh.iced"
        });
        _ref1 = ((_ref = team.rsrcs.gh) != null ? _ref.data : void 0) || {};
        for (team_name in _ref1) {
          team_id = _ref1[team_name];
          url = git_url + '/teams/' + team_id + '/repos/' + repo_full_name;
          git_client.del(url, utils.process_resp(__iced_deferrals.defer({
            assign_fn: (function(__slot_1, __slot_2) {
              return function() {
                return __slot_1[__slot_2] = arguments[0];
              };
            })(errs, team_id),
            lineno: 155
          })));
        }
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        errs = utils.compact_hash(errs);
        return callback(errs);
      };
    })(this));
  };

  handle_remove_repo_event = function(event, team, callback) {
    var repo_full_name;
    repo_full_name = event.r.full_name;
    return remove_repo(repo_full_name, team, callback);
  };

  output = {};

  create_team = function(team_name, callback) {
    var bod, bods, err, errs, gh_perm, gh_team, out, out_errs, perm, resp, url, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    errs = {};
    bods = {};
    url = git_url + '/organizations/' + gh_conf.ORG_ID + '/teams';
    (function(_this) {
      return (function(__iced_k) {
        var _ref;
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/opt/kratos/src/workers/gh.iced"
        });
        _ref = {
          write: 'push',
          admin: 'admin'
        };
        for (perm in _ref) {
          gh_perm = _ref[perm];
          gh_team = {
            "name": team_name + ' team ' + perm,
            "permission": gh_perm,
            "repo_names": []
          };
          git_client.post({
            url: url,
            json: gh_team
          }, utils.process_resp(__iced_deferrals.defer({
            assign_fn: (function(__slot_1, __slot_2, __slot_3, __slot_4) {
              return function() {
                __slot_1[__slot_2] = arguments[0];
                resp = arguments[1];
                return __slot_3[__slot_4] = arguments[2];
              };
            })(errs, perm, bods, perm),
            lineno: 177
          })));
        }
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        out_errs = {};
        out = {};
        output.bods = bods;
        output.errs = errs;
        for (perm in errs) {
          err = errs[perm];
          bod = bods[perm];
          if ((err != null ? err.code : void 0) === 422) {
            continue;
          }
          if (err) {
            out_errs[perm] = err;
            continue;
          }
          out[perm] = bod.id;
        }
        if (_.isEmpty(out_errs)) {
          return callback(null, out);
        } else {
          return callback(out_errs);
        }
      };
    })(this));
  };

  handle_create_team = function(event, team, callback) {
    var team_name;
    team_name = team.name;
    return create_team(team_name, callback);
  };

  handle_add_remove_gh_rsrc_role = function(event, user, callback) {
    var action_name, all_teams, err, errs, i, out, resp, resps, role, role_data, team, team_role, team_roles, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/opt/kratos/src/workers/gh.iced"
        });
        teams.get_all_teams(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return all_teams = arguments[1];
            };
          })(),
          lineno: 201
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        var _i, _len, _ref, _ref1;
        if (err) {
          return callback(err);
        }
        action_name = {
          'r+': 'u+',
          'r-': 'u-'
        }[event.a];
        team_roles = [];
        for (_i = 0, _len = all_teams.length; _i < _len; _i++) {
          team = all_teams[_i];
          _ref = team.roles;
          for (role in _ref) {
            role_data = _ref[role];
            if (role_data.members && (_ref1 = user.name, __indexOf.call(role_data.members, _ref1) >= 0)) {
              team_roles.push({
                team: team,
                role: role
              });
            }
          }
        }
        errs = [];
        resps = [];
        (function(__iced_k) {
          var _j, _len1;
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/opt/kratos/src/workers/gh.iced"
          });
          for (i = _j = 0, _len1 = team_roles.length; _j < _len1; i = ++_j) {
            team_role = team_roles[i];
            add_remove_user(user, team_role.role, action_name, team_role.team, __iced_deferrals.defer({
              assign_fn: (function(__slot_1, __slot_2, __slot_3, __slot_4) {
                return function() {
                  __slot_1[__slot_2] = arguments[0];
                  return __slot_3[__slot_4] = arguments[1];
                };
              })(errs, i, resps, i),
              lineno: 217
            }));
          }
          __iced_deferrals._fulfill();
        })(function() {
          var _j, _len1;
          errs = _.compact(errs);
          if (errs.length) {
            return callback(errs);
          }
          out = {};
          for (_j = 0, _len1 = resps.length; _j < _len1; _j++) {
            resp = resps[_j];
            if (resp) {
              _.extend(out, resp);
            }
          }
          return callback(null, out);
        });
      };
    })(this));
  };

  module.exports = {
    handlers: {
      team: {
        'u+': handle_add_remove_user,
        'u-': handle_add_remove_user,
        't+': handle_create_team,
        't-': null,
        self: {
          'a+': null,
          'a-': handle_remove_repo_event
        },
        other: {
          'a+': null,
          'a-': null
        }
      },
      user: {
        self: {
          'r+': handle_add_remove_gh_rsrc_role,
          'r-': handle_add_remove_gh_rsrc_role
        },
        other: {
          'r+': null,
          'r-': null
        },
        'u+': null,
        'u-': null
      }
    },
    add_asset: add_asset,
    handle_user_event: function(event, doc, callback) {}
  };

}).call(this);