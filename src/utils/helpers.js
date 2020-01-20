module.exports = {
  /**
   * ?Pad function
   *
   * @param sec
   * @returns {string}
   */
  pad(sec) {
    return (sec < 10 ? '0' : '') + sec;
  },

  /**
   * ?Format time function
   *
   * @param seconds
   * @returns {string}
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const second = Math.floor(seconds % 60);

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(second)}`;
  },

  /**
   * ? Generate random token
   *
   * @param {*} len
   * @param {string} [type='A']
   * @returns
   */
  randomString(len, type = 'A') {
    if (type === 'N') {
      return [...Array(len)]
        .map(() => Math.floor(Math.round(Math.random() * 9)))
        .join('');
    }
    return [...Array(len)]
      .map(() => Math.floor(Math.round(Math.random() * 36)).toString(36))
      .join('');
  },
  /**
   * Valid JWT
   *
   * @param {*} req
   * @param {*} res
   * @param {*} done
   * @returns response
   */
  validJWT(req, res, done) {
    req
      .jwtVerify()
      .then(() => done())
      .catch(err => {
        res.send(err);
      });
  },
};
