var models = require('../models/index.js');
var sequelize = require('sequelize');
var path = require('path');
var config = require(path.join(__dirname, '..', '..', 'APPconfig'));

function _insertChatRecords(users) {
    return models.LiveChat.bulkCreate(users,
        {
            updateOnDuplicate: [
                'name', 'email', 'connected', 'messages', 'date', 'updatedAt'
            ]
        });
}

function _formatUsers(users) {
    return Object.keys(users).map(u => {
        return {
            socketId: users[u].id,
            name: users[u].name,
            email: users[u].email,
            connected: users[u].connected,
            messages: JSON.stringify(users[u].messages),
            date: users[u].date
        }
    })
}

exports.filterOld = function (users, chat) {
    let now = Date.now(),
        purged = [];

    // delete user if purge interval has passed
    Object.keys(users).forEach(u => {
        if (now - users[u].date > config.liveChat.purgeInterval) {
            purged.push(users[u]);
            delete users[u];

            // send the disconnect to inform timed out client and admin
            chat.in(u).emit('disconnect', u);
        }
    });

    if (purged.length) {
        console.log("Users purged from RAM:");
        console.dir(purged);
    }

    return users;
};

exports.save = function(users) {
    return _insertChatRecords(_formatUsers(users));
};

exports.queryUser = function (id) {
    return models.LiveChat.findOne({
        where: {socketId: id}
    })
    .then(data => {
        if (data) {
            return {
                id: data.socketId,
                name: data.name,
                email: data.email,
                connected: true,
                messages: JSON.parse(data.messages),
                date: Date.now()
            };
        } else return null;
    })
    .catch(err => {
        console.log('problem with user query');
        throw new Error(err);
    })
};

exports.queryUsers = function (users, offset) {
    return models.LiveChat.findAll({
        where: {
            socketId: {
                $notIn: Object.keys(users).length ? Object.keys(users) : ['']
            }
        },
        limit: 20,
        offset: offset,
        order: [['updatedAt', 'DESC']]
    })
    .then(archivedUsers => {
        let usersObj = {};

        archivedUsers.map(u => u.dataValues)
            .forEach(u => {
                u = {
                    id: u.socketId,
                    name: u.name,
                    email: u.email,
                    connected: false,
                    messages: JSON.parse(u.messages),
                    date: u.date
                };
                usersObj[u.id] = u;
            });

        return usersObj;
    })
    .catch(err => {
        throw new Error(err);
    });
};

