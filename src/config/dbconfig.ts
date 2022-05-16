import dotenv from 'dotenv'
import {connect} from 'mongoose'


dotenv.config();
export const connectDb = async (): Promise<void> => {
     connect(process.env.MONGO_STRING)
     .then(() => console.log('Db is connected'))
     .catch(error => console.log(error))
}