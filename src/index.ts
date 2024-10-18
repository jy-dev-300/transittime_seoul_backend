import './pre-start'; // Must be the first import
import logger from 'jet-logger';
import server from './server';

// **** Constants **** //
const PORT = process.env.PORT || 3000;
const SERVER_START_MSG = `Express server started on port: ${PORT}`;

// **** Run **** //
server.listen(PORT, () => logger.info(SERVER_START_MSG));
