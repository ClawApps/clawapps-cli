import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { select } from '@inquirer/prompts';
import { loadCredentials, saveCredentials } from '../lib/credentials.js';
import { apiGet, type WrappedResponse } from '../lib/api.js';
import { CONFIG } from '../lib/config.js';
import { startCallbackServer } from '../auth/server.js';
import { buildGoogleAuthUrl } from '../auth/google.js';
import { buildAppleAuthUrl } from '../auth/apple.js';
import { googleToOD, odToClawApps } from '../auth/exchange.js';
import type { AuthProvider, UserInfo } from '../lib/types.js';

export async function loginCommand(): Promise<void> {
  // Check if already logged in
  const existing = await loadCredentials();
  if (existing) {
    try {
      const res = await apiGet<WrappedResponse<UserInfo>>(CONFIG.CLAW_ME, existing.access_token);
      if (res.ok) {
        const user = res.data.data;
        console.log(chalk.yellow(`Already logged in as ${user.email || user.name || 'user'}.`));
        console.log(chalk.gray('Run `claw logout` first to switch accounts.'));
        return;
      }
    } catch {
      // Token might be expired, continue with login
    }
  }

  // Choose provider
  const provider = await select<AuthProvider>({
    message: 'Choose login method:',
    choices: [
      { name: 'Google', value: 'google' as AuthProvider },
      { name: 'Apple', value: 'apple' as AuthProvider },
    ],
  });

  // Start local callback server
  const { port, result, close } = await startCallbackServer(provider);
  const redirectUri = `http://localhost:${port}/callback`;

  // Build auth URL and open browser
  const authUrl = provider === 'google'
    ? buildGoogleAuthUrl(redirectUri)
    : buildAppleAuthUrl(redirectUri);

  console.log(chalk.gray(`\nOpening browser for ${provider === 'google' ? 'Google' : 'Apple'} login...`));
  console.log(chalk.gray(`If the browser doesn't open, visit:\n${authUrl}\n`));

  try {
    await open(authUrl);
  } catch {
    console.log(chalk.yellow('Could not open browser automatically.'));
    console.log(chalk.yellow('Please open the URL above manually.'));
  }

  // Wait for callback
  const spinner = ora('Waiting for authentication...').start();

  try {
    const callbackResult = await result;
    spinner.text = 'Exchanging tokens...';

    let odTokens;
    if (callbackResult.provider === 'google' && callbackResult.googleAccessToken) {
      odTokens = await googleToOD(callbackResult.googleAccessToken);
    } else if (callbackResult.odTokens) {
      odTokens = callbackResult.odTokens;
    } else {
      throw new Error('Unexpected callback result');
    }

    // Exchange OD tokens → ClawApps tokens
    const clawTokens = await odToClawApps(odTokens);

    // Save credentials
    await saveCredentials({
      provider,
      access_token: clawTokens.access_token,
      refresh_token: clawTokens.refresh_token,
      od_token: odTokens.access_token,
      od_refresh_token: odTokens.refresh_token,
      logged_in_at: new Date().toISOString(),
    });

    spinner.text = 'Fetching user info...';

    // Fetch user info
    const userRes = await apiGet<WrappedResponse<UserInfo>>(CONFIG.CLAW_ME, clawTokens.access_token);

    spinner.stop();

    if (userRes.ok) {
      const user = userRes.data.data;
      const name = user.name || user.email || 'user';
      console.log(chalk.green(`\nLogged in as ${chalk.bold(name)}`));
      if (user.email) {
        console.log(chalk.gray(`Email: ${user.email}`));
      }
    } else {
      console.log(chalk.green('\nLogin successful!'));
      console.log(chalk.gray('Run `claw whoami` to see your account info.'));
    }
  } catch (err) {
    spinner.stop();
    close();
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(chalk.red(`\nLogin failed: ${message}`));
    process.exit(1);
  }
}
