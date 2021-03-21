const users = [];

function userJoin(id, username, room) {
    const user = { id, username, room };
    users.push(user)
    return user;
}

function getcurrentuser(id) {
    return users.find(user => user.id === id)
}

function getroomusers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getcurrentuser,
    getroomusers
}