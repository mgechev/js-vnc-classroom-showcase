var ACCESS_RIGHTS = {
  read: 0,
  write: 1
};

var AccessRights = {};
AccessRights[ACCESS_RIGHTS.read] = {
  keyboardEnabled: false,
  mouseEnabled: false
};
AccessRights[ACCESS_RIGHTS.write] = {
  keyboardEnabled: true,
  mouseEnabled: true
};

module.exports = {
  ACCESS_RIGHTS: ACCESS_RIGHTS,
  AccessRights: AccessRights
};
