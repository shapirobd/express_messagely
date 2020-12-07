/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
/** User of the site. */

class User {
	/** register new user -- returns
	 *    {username, password, first_name, last_name, phone}
	 */

	static async register({ username, password, first_name, last_name, phone }) {
		const hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const join_at = new Date().toLocaleDateString();
		const results = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, password, first_name, last_name, phone`,
			[username, hashedPwd, first_name, last_name, phone, join_at]
		);
		return results.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		const this_login = new Date().toLocaleDateString();
		const results = await db.query(
			`UPDATE users
      SET last_login_at=$1
      WHERE username=$2
      RETURNING username, password`,
			[this_login, username]
		);
		const user = results.rows[0];
		if (user) {
			if (await bcrypt.compare(password, user.password)) {
				const token = jwt.sign({ username }, SECRET_KEY);
				return token;
			}
		}
		throw new ExpressError("Invalid username/password", 400);
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {}

	/** All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...] */

	static async all() {}

	/** Get: get user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at } */

	static async get(username) {}

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {}

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {id, first_name, last_name, phone}
	 */

	static async messagesTo(username) {}
}

module.exports = User;
