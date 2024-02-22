class SessionComponent {
  constructor() {
    this.req = null;
    this.res = null;
  }

  createSession(data, req, res) {
    this.req = req;
    this.res = res;

    const newSessionData = { ...data };
    this.req.session.user = newSessionData;

    return {
      req: this.req,
      res: this.res,
    };
  }

  hasSession(req, res) {
    if (req.session && !req.session.user) return false;

    if (req.session.user) {
      return {
        message: "User already has a session",
        user: {
          ...req.session.user,
        },
      };
    }
  }

  addToSession(data) {
    const user = this.req.session.user;
    const newSessionData = { ...user, ...data };

    this.req.session.user = { ...newSessionData };

    return {
      req: this.req,
      res: this.res,
    };
  }

  removeFromSession(data) {}

  destroySession(sessionId) {}
}

module.exports = { SessionComponent };
