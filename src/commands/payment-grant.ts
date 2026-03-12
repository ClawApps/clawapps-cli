import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { loadCredentials } from '../lib/credentials.js';
import { CONFIG } from '../lib/config.js';
import { ensureValidToken } from './helpers/ensure-token.js';
import { startPaymentCallbackServer } from '../auth/payment-server.js';

export async function paymentGrantCommand(skillId: string): Promise<void> {
  const credentials = await loadCredentials();

  if (!credentials) {
    console.log(chalk.yellow('Not logged in. Run `claw login` first.'));
    process.exit(1);
  }

  const validated = await ensureValidToken(credentials);
  if (!validated) {
    console.log(chalk.red('Session expired. Please run `claw login` again.'));
    process.exit(1);
  }

  // Start local callback server to receive payment token
  const { port, result, close } = await startPaymentCallbackServer();
  const callbackUrl = `http://localhost:${port}/callback`;

  const url = `${CONFIG.CLAW_WEB_BASE}/payment-grant?skill_id=${encodeURIComponent(skillId)}&token=${encodeURIComponent(validated.access_token)}&callback=${encodeURIComponent(callbackUrl)}`;

  console.log(chalk.gray('\nOpening payment grant page...'));
  console.log(chalk.gray(`If the browser doesn't open, visit:\n${url}\n`));

  try {
    await open(url);
  } catch {
    console.log(chalk.yellow('Could not open browser automatically.'));
    console.log(chalk.yellow('Please open the URL above manually.'));
  }

  const spinner = ora('Waiting for payment confirmation...').start();

  try {
    const payment = await result;

    spinner.stop();

    console.log(chalk.green('\nPayment grant confirmed!'));
    if (payment.payment_token) {
      console.log(chalk.gray(`Payment Token: ${payment.payment_token}`));
    }
    console.log(chalk.gray(`Auto Payment: ${payment.auto_payment ? 'enabled' : 'disabled'}`));
  } catch (err) {
    spinner.stop();
    close();
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(chalk.red(`\nPayment grant failed: ${message}`));
    process.exit(1);
  }
}
