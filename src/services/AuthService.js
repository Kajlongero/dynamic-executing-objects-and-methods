const { forbidden, conflict, unauthorized, badData } = require("@hapi/boom");
const { DBComponent } = require("../components/DBComponent");
const { SessionComponent } = require("../components/SessionComponent");
const { nodemailerConfig } = require("../config/postgresConfig");
const bcrypt = require("bcrypt");
const querys = require("../sql/querys.json");
const dbInstance = new DBComponent();
const sessionInstance = new SessionComponent();
const nodemailer = require("nodemailer");

class AuthService {
  async Login(data, req, res) {
    const { email, password } = data;

    const existSession = sessionInstance.hasSession(req, res);
    if (existSession) return existSession;

    const verifyEmailExists = await dbInstance.query(querys.user.login, [
      email,
    ]);

    const user = verifyEmailExists.rows[0];
    if (!user) throw new unauthorized("unauthorized");

    const comparePasswords = await bcrypt.compare(password, user.password);
    if (!comparePasswords) throw new forbidden("invalid credentials");

    const getPermissions = await dbInstance.query(
      querys.permissions.retrievePermissionsFromUser,
      [user.profile_id]
    );

    delete user.password;

    sessionInstance.createSession(
      {
        ...user,
        permissions: [...getPermissions.rows],
      },
      req,
      res
    );

    return {
      ...user,
      permissions: [...getPermissions.rows],
    };
  }

  async Signup(data, req, res) {
    const { email, password, firstName, lastName } = data;

    const exists = await this.emailExists(email);
    if (exists) throw new conflict("Email already used");

    const encryptPassword = await bcrypt.hash(password, 10);

    const { rows } = await dbInstance.query(querys.profile.createProfile, [
      firstName,
      lastName,
    ]);

    const profileId = rows[0].profile_id;

    const [user] = await Promise.all([
      dbInstance.query(querys.user.signup, [email, encryptPassword, profileId]),
      // crear permisos
    ]);

    sessionInstance.createSession(
      { user_id: user.rows[0].user_id, profile_id: profileId, permissions: [] },
      req,
      res
    );

    return {
      user_id: user.rows[0].user_id,
      profile_id: profileId,
      permissions: [],
    };
  }

  async emailExists(email) {
    const user = await dbInstance.query(querys.auth.getEmail, [`${email}`]);
    if (!user.rows[0]) return false;

    return user;
  }

  #generateCode() {
    let t = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let newCode = "";
    for (let i = 0; i < 64; i++) {
      newCode += `${t.charAt(Math.round(Math.random() * t.length))}`;
    }
    return newCode;
  }

  async RecoverPassword({ email }) {
    const verifyEmail = await this.emailExists(email);
    const user = verifyEmail.rows[0];

    if (!user)
      return {
        message:
          "If the email exists in our registry we will send you a verification code to your email",
      };

    const count = await dbInstance.query(querys.auth.verifyTokens, [user.id]);
    const ct = count.rows[0].count;

    const timestamp = new Date(user.time_to_request_code);
    const now = new Date();

    if (ct > 3 && timestamp > now)
      throw new forbidden("you cannot request the code yet");

    const generatedCode = this.#generateCode();

    const mins = now.getMinutes();
    const timeCalculate = ct > 3 ? ct * ct * 30 : null;

    const timeCode = new Date().setMinutes(mins + 15);
    const newTime = new Date(timeCode).toISOString();

    const timeTooManyCodesSum = new Date().setMinutes(
      ct > 3 ? mins + timeCalculate : mins
    );

    const timeManyCodes = new Date(timeTooManyCodesSum).toISOString();

    await dbInstance.query(querys.auth.newToken, [
      generatedCode,
      newTime,
      user.id,
    ]);

    if (ct > 3) {
      await dbInstance.query(querys.auth.updateTokenTime, [
        user.id,
        timeManyCodes,
      ]);
    }

    const toSend = {
      user_id: verifyEmail.rows[0].id,
      token: generatedCode,
    };

    const stringified = JSON.stringify(toSend);
    const encryptedWithBase64 = Buffer.from(stringified).toString("base64");

    await this.#writeMail(email, encryptedWithBase64);

    await dbInstance.query(querys.user.updateTokenRequestedCount, [
      verifyEmail.rows[0].id,
      ct + 1,
    ]);

    return {
      message:
        "If the email exists in our registry we will send you a verification code to your email",
    };
  }

  async #sendMail(email) {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: nodemailerConfig.MAIL,
        pass: "uwoi zhpk eqfy jsok",
      },
    });

    await transporter.sendMail(email);
    return { message: "email sent" };
  }

  async #writeMail(email, data) {
    let mail = {
      from: nodemailerConfig.MAIL,
      to: `${email}`,
      subject: "Reset your password",
      text: "Password recovery",
      html: `
        <div>
          <p>This is your toke to recover your password</p>
          <p>raw token: ${data}</p>
          <br>URL: http://localhost:8000/process/${data}</br>
        </div>
        `,
    };

    const response = await this.#sendMail(mail);
    return response;
  }

  async ResetPassword(data, newPassword) {
    const decryptedToken = Buffer.from(data, "base64").toString();
    const { user_id, token } = decryptedToken;

    const searchOnDb = await dbInstance.query(querys.auth.findUserByToken, [
      user_id,
      token,
    ]);
    if (!searchOnDb.rows[0])
      throw new forbidden("You cannot perform this action");

    const tokenTime = new Date(searchOnDb.rows[0].validation_time);
    const actualTime = new Date();

    if (tokenTime < actualTime)
      throw new forbidden("Token time expired, request another");

    const encryptPassword = bcrypt.hashSync(newPassword, 10);

    await Promise.all([
      dbInstance.query(querys.user.updatePassword, [encryptPassword]),
      dbInstance.query(querys.auth.deleteTokens, [user_id]),
    ]);

    return {
      message: "Password changed successfully",
    };
  }
}

module.exports = AuthService;
