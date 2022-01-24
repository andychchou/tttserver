const users = [];

function userJoin(id, user, room) {
    const userObj = { id, user, room };
    users.push(userObj);
    return userObj;
}

function getCurrentUser(id) {
    return users.find(userObj => userObj.id === id);
}

function userLeave(id) {
    const index = users.findIndex(userObj => userObj.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room) {
    return users.filter(userObj => userObj.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
};