import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

const Schema = mongoose.Schema({
    dataString: {
        type: String,
    },
    deadline: {
        type: String,
    },
    location: {
        type: String,
    },

    // default
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

export default mongoose.model('Crud', Schema);