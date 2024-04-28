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
  return db.createTable('productVersion', {
    'id': {
      'type':'int',
      'primaryKey': true,
      'autoIncrement': true,
      'unsigned': true
    },
    product_id:{
      "type":"int",
      "notNull": true,
      "foreignKey":{
        "name": "productVersion_product_fk",
        "table": "products",
        "mapping": "id",
        "rules": {
          "onDelete": "cascade",
          "onUpdate": "restrict"
        }
      }
    },
     'versionName': {
      'type':'string',
      'notNull': true
    },
     'image_url': {
      'type':'string',
      'notNull': true
    },
      'price':{
      'type': 'decimal',
      'precision': 10,   
      'scale': 2,        
      'notNull': true
      },
      supplier_id:{
        "type":"int",
        "notNull": true,
        "foreignKey":{
          "name": "productVersion_supplier_fk",
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
  await db.removeForeignKey("productVersion", "productVersion_supplier_fk");
  await db.removeForeignKey("productVersion", "productVersion_product_fk");
  return  db.dropTable('productVersion');
};

exports._meta = {
  "version": 1
};
