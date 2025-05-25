'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const models = require('../models');
        const bcrypt = require('bcrypt');

        // update hash password
        let users = await models.User.findAll();
        let updatedUsers = [];
        users.forEach(item => {
            updatedUsers.push({
                id: item.id,
                password: bcrypt.hashSync("Demo@123", 8) // 8 vòng lặp băm (salt rounds), giúp tăng độ bảo mật
                // Tất cả user trong database sẽ có mật khẩu mới là "Demo@123" (sau khi mã hóa)
            })
        })
        await models.User.bulkCreate(updatedUsers, {
            updateOnDuplicate: ['password']
        })
    },

    async down(queryInterface, Sequelize) {

    }
};