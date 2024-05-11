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
  return db.createTable('carts', {
    'id': {
      'type':'int',
      'primaryKey': true,
      'autoIncrement': true,
      'unsigned': true
    },
    productVersion_id :{
      "type":"int",
      "notNull": true,
      "unsigned": true,
      "foreignKey":{
        "name": "carts_productVersion_fk",
        "table": "productVersion",
        "mapping": "id",
        "rules": {
          "onDelete": "cascade",
          "onUpdate": "restrict"
        }
      }
    },
    'Quantity': {
      'type':'int',
      'unsigned': true
    },
      customer_id:{
      "type":"int",
      "notNull": true,
      "unsigned": true,
      "foreignKey":{
        "name": "carts_customer_fk",
        "table": "customers",
        "mapping": "id",
        "rules": {
          "onDelete": "cascade",
          "onUpdate": "restrict"
        }
      }
    },
  })
};

exports.down = async function(db) {
  await db.removeForeignKey("carts", "carts_supplier_fk");
  await db.removeForeignKey("carts", "carts_productVersion_fk");
  return db.dropTable('carts');
};

exports._meta = {
  "version": 1
};
