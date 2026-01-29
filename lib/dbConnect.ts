import mongoose from 'mongoose'

type ConnectionObject = {
    isConnected ? : number
}

const connection : ConnectionObject = {}

// void here is different from the C++ 
//The function returns nothing and Any return value is ignored
async function dbConnect() : Promise<void>{
    if(connection.isConnected){
        console.log("Database Already Connected")
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "")
        connection.isConnected = db.connections[0].readyState
        console.log('DB is connected Successfully ')
    } catch (error) {
        console.log("Database COnnection Failed" , error )
        process.exit(1)
    }
}

export default dbConnect