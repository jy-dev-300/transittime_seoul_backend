import express from 'express';
import axios from 'axios';  // Use axios to fetch data from external API
import { Line } from '../models/Line'; // Import the Line model
import dotenv from 'dotenv';
import path from 'path';
import xml2js from 'xml2js';
import { getTrainInfoAndArrivalTime } from '../services/responseParserService';


dotenv.config({ path: path.resolve(__dirname, '../../env/test.env') });

const router = express.Router();

const parser = new xml2js.Parser();
// POST request handler

// Route handling GET request at /api/data
router.get('/arrivalTimes', async (req, res) => {
  try {
    console.log('Received request with params:', req.query);  // Check if this logs

    const stationName = req.query.stationName as string;
    const lineName = req.query.lineName as string; // Extract line name from query parameters
    console.log("The station name we are searching for in seoul metro data is: " + stationName + " which is stationName passed in as a query param from arrivatimescreen.tsx in frontend.. this stationName is passed into the url to seoul metro.. the url ending /stationName grabs the right data from seoul's live traintime api for that station");
    // Construct the API URL using the line name
    const seoulApiUrl = `${process.env.SEOUL_METRO_API_URL}/${stationName}`;

    // Check if the API URL is defined
    if (!seoulApiUrl) {
      throw new Error('API URL is not defined in environment variables');
    }

    // Fetch data from the external API using the constructed API_URL
    const response = await axios.get(seoulApiUrl);
    console.log(response.data);

    // Parse the XML response into JSON
    parser.parseString(response.data, (err, response_dict) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return res.status(500).json({ message: 'Error parsing XML data' });
      }

      // You can now process and store the data in the database here
      // Example: processAndStoreData(response_dict);

      // Send the parsed JSON object to the frontend
      const trainsInfo = getTrainInfoAndArrivalTime(response_dict, stationName, lineName); //should be a list of lists [[direction, stationName, lineName, Time], etc]
      
      res.json(trainsInfo);
      console.log(`Log of info for ${stationName} ${lineName}: ${trainsInfo}`);
      
    });

  } catch (error) {
    console.error('Error fetching arrival times:', error);
    res.status(500).json({ message: 'Error fetching arrival times' });
  }
});

// Sample function to process and store data in the database
// const processAndStoreData = (rawData: any) => {
//   for (const lineData of rawData) {
//     const lineName = lineData.trainLineNm; // Example field from your data
//     const stations = lineData.statnNm; // Example field
//     const status = lineData.btrainSttus; // Example field
//     const arrivalTimes = lineData.arvlMsg2; // Example field

//     // Access the database to find if this line exists
//     Line.findOne({ lineName: lineName }, async (err, existingLine) => {
//       if (err) {
//         console.error('Database query error:', err);
//         return;
//       }

//       if (existingLine) {
//         // Update existing line in the database
//         existingLine.stations = stations;
//         existingLine.status = status;
//         existingLine.arrivalTimes = arrivalTimes;

//         // Save the updated line back to the database
//         await existingLine.save();
//       } else {
//         // Create a new instance of the Line model
//         const newLine = new Line({
//           lineName: lineName,
//           stations: stations,
//           status: status,
//           arrivalTimes: arrivalTimes
//         });

//         // Save the new line to the database
//         await newLine.save();
//       }
//     });
//   }
// };

export default router;
