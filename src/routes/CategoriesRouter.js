// ? Get utils
const {db, helpers} = require('../utils');

module.exports = async (fastify, _opts, next) => {
  // ? Get User
  fastify.get(
    '/list',
    {
      preValidation: helpers.validJWT,
    },
    async (req, res) => {
      await db('categories')
        .then(async us => {
          res.send({
            error: false,
            categories: us,
          });
        })
        .catch(err => {
          req.log.error(err);
        });
    },
  );

  await next();
};
