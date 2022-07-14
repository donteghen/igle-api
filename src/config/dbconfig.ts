
import {connect} from 'mongoose'

export const connectDb = async (): Promise<void> => {
     connect(process.env.MONGO_STRING)
     .then(() => console.log('Db is connected and server is ready'))
     .catch(error => console.log(error))
}