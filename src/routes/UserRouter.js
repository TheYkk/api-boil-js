/* eslint-disable prefer-const */
// ? Get utils
const {db, helpers, queue, lodash} = require('../utils');

// ? Get bcrypt for password  hashing
const bcrypt = require('bcrypt');

// ? Validators
const userSchema = {
  type: 'object',
  properties: {
    name: {type: 'string', minLength: 3},
    surname: {type: 'string', minLength: 3},
    email: {format: 'email', maxLength: 255},
    password: {type: 'string'},
    idnumber: {type: 'number', minLength: 11},
    phone: {type: 'number', minLength: 11},
    birth: {type: 'string'},
  },
};

module.exports = async (fastify, _opts, next) => {
  // ? Get User
  fastify.get(
    '/me',
    {
      preValidation: helpers.validJWT,
    },
    async (req, res) => {
      const {user} = req;

      await db('users')
        .select('*')
        .where('id', user.id)
        .first()
        .then(async us => {
          if (us == null) {
            req.log.error(`User not found ,  id ${user.id}`);

            res.send({
              error: true,
              code: 404,
              desc: 'User not found',
            });
          }

          delete us.password;
          delete us.email_code;
          const token = fastify.jwt.sign({id: us.id});

          res.send({
            error: false,
            user: us,
            token,
          });
        })
        .catch(err => {
          req.log.error(err);
        });
    },
  );

  // ? Edit User
  fastify.post(
    '/edit',
    {
      schema: {body: userSchema},
      preValidation: helpers.validJWT,
    },
    async (req, res) => {
      const {name, surname, email, password, idnumber, phone, birth} = req.body;
      const {user} = req;

      await db('users')
        .select('*')
        .where('id', user.id)
        .first()
        .then(async us => {
          if (us == null) {
            req.log.error(`User not found ,  id ${user.id}`);

            res.send({
              error: true,
              code: 404,
              desc: 'User not found',
            });
          }

          let editedUser = {
            first_name: name,
            last_name: surname,
            password,
            id_number: idnumber,
            phone,
            birth,
          };

          // ? if user wants to change email address , sent email confirm
          if (us.email !== email) {
            editedUser.email = email;
          }

          let errResponse = [];
          // ? if user had confirmed  id , user can't change id number , name , surname and birth date
          if (us.status === 3) {
            delete editedUser.first_name;
            delete editedUser.last_name;
            delete editedUser.id_number;
            delete editedUser.birth;

            errResponse = errResponse.concat({
              fields: ['name', 'surname', 'idnumber', 'birth'],
              error:
                "Your account is already verified , you can't change your information",
            });
          }
          // ? if password field is null , don't change password
          if (password === '') {
            delete editedUser.password;
          } else {
            const hashedPassword = bcrypt.hashSync(password, 5);
            editedUser.password = hashedPassword;
          }
          if (lodash.size(editedUser) > 0) {
            editedUser.email_code = `${helpers.randomString(
              6,
              'N',
            )}${helpers.randomString(25)}`;
            await db('users')
              .where({id: us.id})
              .update(lodash.omit(editedUser, ['email']))
              .returning('*')
              .then(u => {
                const returnUser = {...u[0]};

                if (editedUser.email) {
                  // * Redis new event for sent confirm email

                  // ? Send message to email service
                  queue
                    .then(conn => {
                      req.log.debug('Rabbit mq connection succesfuly');
                      return conn.createChannel();
                    })
                    .then(ch => {
                      return ch
                        .assertQueue('mail', {durable: true})
                        .then(_ok => {
                          const obj = {
                            data: {
                              user: {
                                name: `${returnUser.first_name} ${returnUser.last_name}`,
                                code: returnUser.email_code,
                                email: editedUser.email,
                                lang: returnUser.lang,
                              },
                            },
                            action: 'changemail',
                            type: 1,
                          };

                          const buf = Buffer.from(JSON.stringify(obj));
                          req.log.debug(`Message send ${obj}`);
                          return ch.sendToQueue('mail', buf);
                        });
                    })
                    .catch(err => {
                      req.log.error(err);
                    });
                }
                delete returnUser.password;
                delete returnUser.email_code;
                const token = fastify.jwt.sign({id: us.id});

                res.send({
                  error: false,
                  desc: 'User edited',
                  user: returnUser,
                  token,
                });
              });
          } else if (errResponse.length > 0) {
            res.send({
              error: true,
              desc: 'Errors.',
              errors: errResponse,
            });
          } else {
            res.send({
              error: true,
              desc: 'Nothing changed.',
            });
          }
        })
        .catch(err => {
          req.log.error(err);
        });
    },
  );

  await next();
};
