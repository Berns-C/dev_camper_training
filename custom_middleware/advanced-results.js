const advancedResults = (model, populate) => async (req, res, next) => {
    const reqQuery = { ...req.query };

    //Fields to exclude for filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Remove the select key word from request param to normally perform mongoose find using the copied object if 'req.query'.
    removeFields.forEach(param => delete reqQuery[param]);

    // Converts req.query operator param into mongodb '$<operator>' operator
    let queryStr = JSON.parse(
        JSON.stringify(reqQuery)
        .replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    );

    let query = model.find(queryStr);

    // Select Fields.
    if (req.query.select) {
        let selectQuery = req.query.select.split(',').join(' ');
        query.select(selectQuery).exec(function (err, selectedFields){
            if (err) return err;
            return selectedFields;
        });
    }

    // Sort Fields.
    if (req.query.sort) {
        let sortBy = req.query.select.split(',').join(' ');
        query.sort(sortBy);
    } else {
        query.sort('-createdAt');
    }

     // Pagination
     const page = parseInt(req.query.page, 10) || 1;
     const limit = parseInt(req.query.limit, 10) || 10;
     const startIndex = (page - 1) * limit;
     const endIndex = page * limit;
     const total = await model.countDocuments();
     query.skip(startIndex).limit(limit);

    // Pagination Result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    if (populate) {
        query = query.populate(populate);
    };

    // Execute query
    const results = await query;

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
}

module.exports = advancedResults;