// ? Get utils
const {db, helpers, queue, redis} = require('../utils');

// ? Get bcrypt for password  hashing
const bcrypt = require('bcrypt');

// ? Validators
const registerSchema = {
  type: 'object',
  required: ['lang', 'name', 'surname', 'email', 'password'],
  properties: {
    lang: {type: 'string'},
    name: {type: 'string', minLength: 3},
    surname: {type: 'string', minLength: 3},
    email: {format: 'email', maxLength: 255},
    password: {type: 'string', minLength: 3},
  },
};

const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {format: 'email', maxLength: 255},
    password: {type: 'string', minLength: 3},
  },
};
const confirmSchema = {
  type: 'object',
  required: ['code'],
  properties: {
    code: {type: 'string', minLength: 6},
  },
};

module.exports = async (fastify, _opts, next) => {
  // ? Register user
  fastify.post(
    '/register',
    {schema: {body: registerSchema}},
    async (req, res) => {
      const {lang, name, surname, email, password} = req.body;

      // req.log.debug({lang, name, surname, email, password});
      await db('users')
        .select('id', 'status')
        .where('email', email)
        .first()
        .then(async u => {
          if (u) {
            req.log.error(`User already found`);

            res.send({
              error: true,
              desc: 'User already found',
            });
          }

          const hashedPassword = bcrypt.hashSync(password, 5);

          // req.log.error(hashedPassword);

          await db('users')
            .insert({
              lang,
              first_name: name,
              last_name: surname,
              email,
              password: hashedPassword,
              email_code: `${helpers.randomString(
                6,
                'N',
              )}${helpers.randomString(25)}`,
            })
            .returning('*')
            .then(async us => {
              // ? Send message to email service
              queue
                .then(conn => {
                  req.log.debug('Rabbit mq connection succesfuly');
                  return conn.createChannel();
                })
                .then(ch => {
                  return ch.assertQueue('mail', {durable: true}).then(_ok => {
                    const obj = {
                      data: {
                        user: {
                          name: `${us[0].first_name} ${us[0].last_name}`,
                          code: us[0].email_code,
                          email: us[0].email,
                          lang: us[0].lang,
                        },
                      },
                      action: 'register',
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

              // * Don't show sensitive information
              const returnUser = {...us[0]};

              delete returnUser.password;
              delete returnUser.email_code;
              const token = fastify.jwt.sign({id: returnUser.id});

              res.send({
                error: false,
                desc: 'Register ok',
                user: returnUser,
                token,
              });
            });
        })
        .catch(err => {
          req.log.error(err);
        });
    },
  );

  // ? Login user
  fastify.post(
    '/login',
    {
      schema: {body: loginSchema},
      onRequest: (req, res, done) => {
        redis.get(`user.auth.fail.${req.ip}`, (err, data) => {
          if (data > 5) {
            return res.code(403).send(`Maximum login attemp`);
          }
          return done();
        });
      },
    },
    async (req, res) => {
      const {email, password} = req.body;
      await db('users')
        .select('*')
        .where('email', email)
        .first()
        .then(async user => {
          if (!user) {
            req.log.error(`User not found`);

            res.send({
              error: true,
              desc: 'Email or Password not match',
              fields: ['email', 'password'],
            });
          }

          await bcrypt.compare(password, user.password, async (_err, comp) => {
            if (comp) {
              const token = fastify.jwt.sign({id: user.id});

              // * Don't show sensitive information
              delete user.password;
              delete user.email_code;

              res.send({
                error: false,
                desc: 'Login ok',
                user,
                token,
              });
            } else {
              await redis
                .multi() // starting a transaction
                .set([`user.auth.fail.${req.ip}`, 1, 'EX', 60, 'NX']) // SET UUID 0 EX 60 NX
                .incr(`user.auth.fail.${req.ip}`) // INCR UUID
                .exec(err => {
                  if (err) {
                    return res.status(500).send(err.message);
                  }
                  return true;
                });
              res.send({
                error: true,
                desc: 'Email or Password not match',
                fields: ['email', 'password'],
              });
            }
          });
        })
        .catch(async err => {
          req.log.error(err);
        });
    },
  );

  // ? Login user
  fastify.post(
    '/confirm',
    {
      schema: {body: confirmSchema},
      preValidation: helpers.validJWT,
    },
    async (req, res) => {
      const {code} = req.body;
      const {user} = req;

      await db('users')
        .select('id', 'status', 'email_code')
        .where('id', user.id)
        .first()
        .then(async u => {
          if (u == null) {
            req.log.error(`User not found , code ${code} , id ${user.id}`);

            res.send({
              error: true,
              desc: 'User not found',
            });
          }

          if (u.status === 0) {
            if (u.email_code.slice(0, 6) === code) {
              await db('users')
                .where({id: u.id})
                .update({status: 1})
                .then(() => {
                  res.send({
                    error: false,
                    desc: 'User activated',
                  });
                });
            }

            res.send({
              error: true,
              desc: 'Sended code is false',
            });
          } else {
            res.send({
              error: true,
              desc: 'User already activated or banned',
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
