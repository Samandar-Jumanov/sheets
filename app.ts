import express , { Express , Request , Response } from "express"
import { compareAndUpdateSheet } from "./utils/spreedsheet";
import cron  from "node-cron"
import Logger from "./lib/winston";

const app  : Express = express();
// health checker 

app.get("/" , ( request  : Request , response : Response) => {
       response.json({
           message : "Success"
       })
})



app.listen(3000  , async  ( ) => {
    // Schedule time to check the data 
        Logger.info("Started to check")
    await  compareAndUpdateSheet()
        // cron.schedule('*/15 * * * *',  async () => {
        // });


     console.log("Server started on port 3000")
})