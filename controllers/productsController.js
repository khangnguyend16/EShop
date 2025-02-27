'use strict';

const controller = {};
const models = require('../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

controller.getData = async (req, res, next) => {     // middleware
    // Categories
    let categories = await models.Category.findAll({
        include: [{ model: models.Product }]
    })
    res.locals.categories = categories;

    // Brands
    let brands = await models.Brand.findAll({
        include: [{ model: models.Product }]
    })
    res.locals.brands = brands;

    // Tags
    let tags = await models.Tag.findAll();
    res.locals.tags = tags

    next();
}

controller.show = async (req, res) => {
    let category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
    let brand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);
    let tag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);
    let keyword = req.query.keyword ? req.query.keyword.trim() : "";
    let sort = ['price', 'newest', 'popular'].includes(req.query.sort) ? req.query.sort : 'price';
    let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page));

    let options = {
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
        where: {},
    }
    if (category > 0) {
        options.where.categoryId = category;
    }
    if (brand > 0) {
        options.where.brandId = brand;
    }
    if (tag > 0) {
        options.include = [{
            model: models.Tag,
            where: { id: tag }
        }]
    }
    if (keyword != '') {
        options.where.name = {
            [Op.iLike]: `%${keyword}%`
        }
    }
    switch (sort) {
        case 'newest':
            options.order = [['createdAt', 'DESC']];
            break;
        case 'popular':
            options.order = [['stars', 'DESC']];
            break;
        default:
            options.order = [['price', 'ASC']];
    }
    res.locals.sort = sort;

    // Tránh duplicate param sort
    res.locals.originalUrl = removeParam('sort', req.originalUrl);

    //Kiểm tra req.query có rỗng hay không
    if (Object.keys(req.query).length == 0) {
        res.locals.originalUrl = res.locals.originalUrl + "?";
    }

    //Pagination
    let limit = 6;
    let offset = (page - 1) * limit;
    let products = await models.Product.findAll(options);

    res.locals.pagination = {
        page,
        limit,
        totalRows: products.length,
        queryParams: req.query,
    }
    res.locals.products = products.slice(offset, offset + limit);
    res.render('product-list');
}

controller.showDetails = async (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    let product = await models.Product.findOne({
        attributes: ['id', 'name', 'stars', 'oldPrice', 'price', 'summary', 'description', 'specification'],
        where: {
            id
        },
        include: [{
            model: models.Image,
            attributes: ['name', 'imagePath']
        }, {
            model: models.Review,
            attributes: ['id', 'review', 'stars', 'createdAt'],
            include: [{
                model: models.User,
                attributes: ['firstName', 'lastName']
            }]
        }, {
            model: models.Tag,
            attributes: ['id']
        }]
    });
    res.locals.product = product;

    let tagIds = [];
    product.Tags.forEach(tag => tagIds.push(tag.id));

    let relatedProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'oldPrice', 'price'],
        include: [{
            model: models.Tag,
            attributes: ['id'],
            where: {
                id: { [Op.in]: tagIds }
            }
        }],
        limit: 10
    })
    res.locals.relatedProducts = relatedProducts;
    res.render('product-detail');
}

// Hàm xóa 1 param trong query string
function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

module.exports = controller;