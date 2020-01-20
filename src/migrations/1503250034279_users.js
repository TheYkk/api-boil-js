exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.increments();
    table
      .string('email', 254)
      .notNullable()
      .unique(); // ? User unique email
    table.string('password', 254).notNullable(); // ? User password with crypted password

    table.string('first_name'); // ? User name
    table.string('last_name'); // ? User lastname
    table.string('lang'); // ? User language
    table.string('email_code'); // ? Uniq 6 char code for email validation
    table.integer('status').defaultTo(0); // ? User status example (0: Disabled , 1: Active , 2: Banned , 3: Confirmed )
    table.integer('level').defaultTo(0); // ? User level
    table.integer('referer').nullable(); // ? User referer id

    table.string('phone', 15).nullable(); // ? User phone number
    table.string('ip', 50); // ? User register ip

    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
