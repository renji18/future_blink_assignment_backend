import app from './app';
import config from './config/config';
import agenda from './utils/agendaInstance';

(async function startAgenda() {
  await agenda.start();
})();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
