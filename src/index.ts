import { Command } from 'commander';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';
import { tokenCommand } from './commands/token.js';
import { paymentGrantCommand } from './commands/payment-grant.js';
import { rechargeCreditsCommand } from './commands/recharge-credits.js';
import { subscribeCommand } from './commands/subscribe.js';

const program = new Command();

program
  .name('clawapps')
  .description('ClawApps CLI - Authenticate, manage payments, and recharge credits via QR code')
  .version('0.5.0');

program
  .command('login')
  .description('Log in via QR code (scan to authenticate, valid for 3 minutes)')
  .action(loginCommand);

program
  .command('logout')
  .description('Log out of your ClawApps account')
  .action(logoutCommand);

program
  .command('whoami')
  .description('Show your ClawApps account info')
  .action(whoamiCommand);

program
  .command('token')
  .description('Print valid access token (auto-refreshes if expired)')
  .action(tokenCommand);

program
  .command('payment-grant')
  .description('Authorize skill payment via QR code (valid for 3 minutes)')
  .argument('<skill_id>', 'The skill ID to grant payment for')
  .action(paymentGrantCommand);

program
  .command('recharge-credits')
  .description('Display QR code to recharge credits')
  .action(rechargeCreditsCommand);

program
  .command('subscribe')
  .description('Display QR code to subscribe membership')
  .action(subscribeCommand);

program.parse();
