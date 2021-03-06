/**
 * @author  ibolyauveges
 * @since   0.0.1
 *
 * @description
 * This module provides data manipulation operations
 * on Category objects.
 * The underlying store is a persistent MongoDB database.
 * Configuration can be found in config/default.js.
 *
 * @see     category.model.js
 * @see     category.api.js
 */
(function () {
    'use strict';

    const log       = require('../../logger/logger');
    const mongoose  = require('../../database/database');
    let SanitizedCategory       = require('./category.model');
    
    //this is a model for the categories Collection
    //second parameter is a schema for the type of the collection's fields
    const database = mongoose.model('categories', new mongoose.Schema({id:Number, name:String,description:String,checked:Number,
                style: {cardBackGroundColor:String,cardBackGroundColorClass:String,
                        cardForeGroundColor:String,cardForeGroundColorClass:String,
                        cardFontName:String,cardFontSize:Number}, creationDate: { type: Date, default: Date.now }}));

    //this will be returned with the methods of this modul
    let operations = {};

    //creates a new category: category is the data for insertion
    //onSucces and onError are callback functions
    operations.addCategory = function (category, onSuccess, onError) {
        log.debug('Saving new category...');
        if (!(category instanceof SanitizedCategory)) {
            throw new Error('Invalid category to insert!');
        }

        if (!category.id) { category.id = Date.now(); }
        database.create(category, (error, newcategory) => {
            if (error) {
                onError(error);
                return;
            }

            log.debug('New category has been successfully saved with id %d.', newcategory.id);
            onSuccess(newcategory);
        });
    };

    //modifies a category: category is the data for update
    operations.modCategory = function (category, response) {
        log.debug('Update category...');
        if (!(category instanceof SanitizedCategory)) {
            throw new Error('Invalid category to update!');
        }

        if (!category.id) { throw new Error('Invalid categoryId to update!'); }
        database.findOneAndUpdate({ id: category.id}, 
        {   name: category.name,
            description:category.description,
            style:category.style
        },
        {upsert:true},
          response //this is the callback function
        );
        
    };

     //delete a category
     operations.delCategory = function (id, response) {
        log.debug('Delete a category with id=%d...', id);
        if (!id) {
            throw new Error('Wrong ID!');
        }

        database.remove({ id: id}, 
             response //this is the callback function
        );
        
    };
    //retrieves the all categories
    operations.findAll = function (onSuccess, onError) {
        log.debug('Retrieving every category...');
        database.find({}, (error, categories) => {
            if (error) {
                onError(error);
                return;
            }

            log.debug('Found %d categories.', categories.length);
            onSuccess(categories);
        });
    };

    //returns one category with a particular id
    operations.findById = function (id, onSuccess, onError) {
        log.debug('Getting category with ID %d...', id);
        database.findOne({ id: id }, (error, category) => {
            if (error || !category) {
                onError(error);
                return;
            }

            onSuccess(category);
        });
    };

    //retrieves those docs from the categories Collection whose name contains the given search string:namePart
    operations.findInTitle = function (namePart, onSuccess, onError) {
        log.debug('Finding categories with "%s" in the name...', namePart);
        database.find({ name: new RegExp(namePart, 'g') }, (error, categories) => {
            if (error) {
                onError(error);
                return;
            }

            log.debug('Found %d categories matching the search term in their name.', categories.length);
            onSuccess(categories);
        });
    };

    module.exports = operations;

}());
