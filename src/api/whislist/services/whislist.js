'use strict';

/**
 * whislist service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::whislist.whislist');
