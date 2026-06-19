const mongoose = require('mongoose');
const { FormateData } = require('../../utils');
const _ = require("lodash");
const moment = require('moment');

// Common Create Query for Major Create APIs
module.exports.Create= async ({ req = {}, res = {}, model = null, data = null, populate = null, returnRes = false, mongooseSession = null, message = "Record successfully created" }) => {
    // Check this function for mongoose session
    const hasOwnSession = _.isNull(mongooseSession) || !returnRes;
    // create mongoose session if not passed
    const session = hasOwnSession ? await mongoose.startSession() : mongooseSession;
    // start mongoose session if not passed
    if(hasOwnSession) session.startTransaction();

    try {
        // use data from req.body if data is not passed
        data = _.isNull(data) ? req.body : data; 
        // add created_by field to data
        data = _.isArray(data) ? _.map(data, (e) => _.extend(e, { 'created_by': req?.user?.id })) : _.extend(data, { 'created_by': req?.user?.id });
        // create data in passed collection with mongoose session
        var output = await model.insertMany(data, { "session": session });
        // check if populate is not empty
        if(!_.isNull(populate)) { 
            // populate data if populate is not empty
            output = await model.find({ "_id": { $in: _.map(output,'_id') } }).session(session).populate(populate);
        }
        // if mongoose session is not passed
        if (hasOwnSession) await session.commitTransaction();
        // return output if returnRes is true
        if (returnRes) return output;
        // send response if returnRes is false
        res.status(200).json({ "status": 'ok', "message": message, 'data': output });
    } catch (error) {
        // abort mongoose session if not passed
        if(hasOwnSession) await session.abortTransaction();
        // throw error if returnRes is true
        if(returnRes) throw error;
        // send error response if returnRes is false
        res.status(500).send({ status: "failed", message: error.code === 11000 ? "Duplicate Record" : "Create failed", error });
    } finally { 
        // end mongoose session if not passed
        if(hasOwnSession) session.endSession();
    }
}

// Common Update Query for Major Update APIs
module.exports.Update = async ({ req = {}, res = {}, model = null, data = null, filter = {}, operator = null, upsert = false, condition = null, populate = null, returnRes = false, mongooseSession = null, message = 'Record successfully updated' }) => {  
    // Check this function for mongoose session
    const hasOwnSession = _.isNull(mongooseSession) || !returnRes;
    // create mongoose session if not passed
    const session = hasOwnSession ? await mongoose.startSession() : mongooseSession;
    // start mongoose session if not passed
    if(hasOwnSession) session.startTransaction();

    try {
        // use data from req.body if data is not passed
        if(_.isNull(condition)) {
            // use data from req.body if data is not passed
            data = _.isNull(data) ? req.body : data;
            // operator for update query
            operator = _.isNull(operator) ? '$set' : operator;
            // add updated_by field to data
            if(operator == '$set') data = _.extend(data,{ 'updated_by': req.user?.id });
            // create data in passed collection with mongoose session
            else data = _.extend(data,{ $set: { 'updated_by': req.user.id } });
        } else {
            // assign condition to data
            data = condition;
            // add updated_by field to data
            data["$set"] = _.includes(_.keys(data),"$set") ? _.extend(data["$set"],{ "updated_by": req.user.id }) : { "updated_by": req.user.id };
            // add updated_at field to data
            if(!_.isEmpty(req.query?.updated_at)) {
                // get existing data from collection
                const existingData = await model.findOne(filter).populate(populate);
                // check if existing data is not empty
                if(moment(existingData.updated_at).isAfter(moment(req.query.updated_at))) {
                    // throw error if existing data is updated after the passed updated_at
                    let response = { "code": 409, "status": "failed" ,"message": "The Record is already updated by some one, try now...", 'data': existingData };
                    // throw error if returnRes is true
                    if(returnRes) throw response;
                    // send error response if returnRes is false
                    if(hasOwnSession) await session.abortTransaction();
                    // end mongoose session if not passed
                    return res.status(409).send(_.omit(response,'code'));
                } 
            }
        }
        // update data in passed collection with mongoose session
        const output = await model.findOneAndUpdate(filter, data, { upsert , "new": true, "session": session }).populate(populate);
        // // check if output is empty 
        FormateData(output);
        // commit mongoose session if not passed
        if(hasOwnSession) await session.commitTransaction();
        // return output if returnRes is true
        if(returnRes) return output;
        // send response if returnRes is false
        res.status(200).json({ "status": 'ok', "message": message, 'data': output });
    } catch (error) {
        // abort mongoose session if not passed
        if(hasOwnSession) await session.abortTransaction();
        // throw error if returnRes is true
        if(returnRes) throw error;
        // send error response if returnRes is false
        else res.status(500).send({ status: "failed", message: "Update failed", error });
    } finally {
        // end mongoose session if not passed
        if(hasOwnSession) session.endSession();
    }
}

// Common Get Query for Major Get APIs
module.exports.Get = async ({ req = {}, res = {}, model = null, filter = {}, search = null, pageIndex = 0, pageSize = 0, populate = null, sort = null, select = null, returnRes = false, message = null }) => {
    try {
        // Calculate skipCount for pagination using pageIndex and pageSize
        let skipCount = parseInt(pageIndex) * parseInt(pageSize);
        // Check if skipCount is less than 0
        skipCount = skipCount < 0 ? 0 : skipCount;
        // Check if select is null
        select = _.isNull(select) ? { "created_at" : 0 } : select;
        // Check if sort is null
        sort = _.isNull(sort) ? { "created_at": -1 } : sort;
        // populate data if populate is not empty
        populate = 
            (_.values(select).includes(1) || (_.values(select).includes(0) && _.keys(select) > 2)) ?  // check if select is not empty and has extra fields other than created_at and is_active
                _.filter(populate,(e)=>_.includes(_.keys(select),e.path)) : // populate only selected fields
                    populate; // populate all fields
        // search data if search is not empty
        search = _.isEmpty(search) ? {} : { $or: search }; 
        // filter data if filter is not empty
        filter = _.reduce(filter,(initialValue,value,key)=>( 
            _.extend(initialValue,{ [key]: _.isArray(value) && !_.includes(key,'$') ? { $in: value } : value })    
        ), {});

        // console.log(filter,'middle');
        
        
        // get data from collection
        var output = 
            await model.find({ $and: [ filter, search ] }, select)
            .skip(parseInt(skipCount))
            .limit(parseInt(pageSize))
            .lean()
            .populate(populate)
            .sort(sort);
        // get total count from collection
        var count = pageSize > 0 ? await model.countDocuments({ $and: [filter, search]}) : output.length;
        // return output if returnRes is true
        let responseData = { "data": output, "totalCount": count };
        // return output if returnRes is true
        return returnRes ? responseData : res.status(200).send({ "status": 'ok', ..._.isNull(message) ? {} : { message }, ...responseData });
    } catch (error) {

        console.log(error);
        
        // throw error if returnRes is true
        if(returnRes) throw error;
        // send error response if returnRes is falses
        else res.status(500).send({ status: "failed", message: "Get failed", error });
    }
}

// Delete Query for Major Delete APIs
module.exports.Delete = async ({req = {}, res = {}, model = null, filter = {}, returnRes = false, mongooseSession = null, message = "Record successfully deleted" }) => {
    // Check this function for mongoose session
    const hasOwnSession = _.isNull(mongooseSession) || !returnRes;
    // create mongoose session if not passed
    const session = hasOwnSession ? await mongoose.startSession() : mongooseSession;
    // start mongoose session if not passed
    if(hasOwnSession) session.startTransaction();
    try {
        // delete data from collection
        var output = await model.deleteOne(filter, { "session": session });
        if(hasOwnSession) await session.commitTransaction();        
        // return output if returnRes is true
        if(returnRes) return output;
        // send response if returnRes is false
        res.status(200).json({ "status": 'ok', "message": message });
    } catch (error) {
        // abort mongoose session if not passed
        if(hasOwnSession) await session.abortTransaction();
        // throw error if returnRes is true
        if(returnRes) throw error;
        // send error response if returnRes is false
        else res.status(500).send({ status: "failed", message: "Delete failed", error });
    } finally { 
        // end mongoose session if not passed
        if(hasOwnSession) session.endSession();
    }
}

module.exports.generateSequenceNumber = async({ prefix = null }) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because months are zero-based
    const day = ('0' + currentDate.getDate()).slice(-2);
    const hours = ('0' + currentDate.getHours()).slice(-2);
    const minutes = ('0' + currentDate.getMinutes()).slice(-2);
    const seconds = ('0' + currentDate.getSeconds()).slice(-2);
    const timestamp = currentDate.getTime();
    const finYear = getFinancialYear(currentDate);
    const orderNumber = `${prefix.toUpperCase()}${finYear}${month}${day}${timestamp}`;
    return orderNumber;
}
  
  // Function to get financial year
function getFinancialYear(date) {
    const year = date.getFullYear();
    const month = date.getMonth(); // Months are zero-based
    const financialYear = month < 3 ? year - 1 : year; // Assuming financial year starts from April (month 3)
    return financialYear.toString().slice(-2); // Extracting the last two digits
}
