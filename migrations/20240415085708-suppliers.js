'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('suppliers', {
    'id': {
      'type':'int',
      'primaryKey': true,
      'autoIncrement': true,
      'unsigned': true
    },
     'zhiFuVerification': {
      'type':'string',
      'notNull': true
    },
     'phoneNumber': {
      'type':'string',
      'notNull': true
    },
      'wxId':{
      'type': 'string',
      'notNull': true
    },
      'studioName': {
      'type': 'string',
      'notNull': true
      },
  })
};


exports.down = function(db) {
  return  db.dropTable('suppliers');
};

exports._meta = {
  "version": 1
};
