import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

const Schema = mongoose.Schema({
    fullname: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'cashier', 'employee'],
        default: 'employee',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    createdAt: {
        type: Number
    },
    updatedAt: {
        type: Number
    }
},
    {
        timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
    });

// pagination plugins (package)
Schema.plugin(mongoosePaginate);

export default mongoose.model('User', Schema);

// ada tips
// sumber => https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
// Note: If you are working on a big application with critical data you should reconsider updating your documents. I would advise you to work with immutable, append-only data (lambda architecture). What this means is that you only ever allow inserts. Updates and deletes should not be allowed! If you would like to "delete" a record, you could easily insert a new version of the document with some timestamp/version filed and then set a deleted field to true. Similarly if you want to update a document – you create a new one with the appropriate fields updated and the rest of the fields copied over.Then in order to query this document you would get the one with the newest timestamp or the highest version which is not "deleted" (the deleted field is undefined or false`).

// Data immutability ensures that your data is debuggable – you can trace the history of every document. You can also rollback to previous version of a document if something goes wrong. If you go with such an architecture ObjectId.getTimestamp() is all you need, and it is not Mongoose dependent.