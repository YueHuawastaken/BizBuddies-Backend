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
  return db.createTable('orders', {
    'id': {
      'type':'int',
      'primaryKey': true,
      'autoIncrement': true,
      'unsigned': true
    },
    productVersion_id :{
      "type":"int",
      "notNull": true,
      "foreignKey":{
        "name": "orders_productVersion_fk",
        "table": "productVersion",
        "mapping": "id",
        "rules": {
          "onDelete": "cascade",
          "onUpdate": "restrict"
        }
      }
    },
    customer_id :{
      "type":"int",
      "notNull": true,
      "foreignKey":{
        "name": "orders_customer_fk",
        "table": "customers",
        "mapping": "id",
        "rules": {
          "onDelete": "cascade",
          "onUpdate": "restrict"
        }
      }
    },
    'orderType': {
      'type':'string',
      'notNull': true
    },
    'totalPayable':{
      'type': 'decimal',
      'precision': 10,   
      'scale': 2,        
      'notNull': true
      },
      supplier_id:{
        "type":"int",
        "notNull": true,
        "foreignKey":{
          "name": "orders_supplier_fk",
          "table": "suppliers",
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
  await db.removeForeignKey("orders", "orders_supplier_fk");
  await db.removeForeignKey("orders", "orders_productVersion_fk");
  await db.removeForeignKey("orders", "orders_customer_fk");
  return db.dropTable('orders');
};

exports._meta = {
  "version": 1
};
