import { config } from '@/infra/config/index';
import { createServer } from '@/bootstrap/create-server';

const APP = createServer();

APP.listen(config.server.port, () => {
	console.log(`Auth Service running on port ${config.server.port} in ${config.server.env} mode`);
});
